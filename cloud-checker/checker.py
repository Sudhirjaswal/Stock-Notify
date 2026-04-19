"""
StockSentry Cloud Checker
Runs on GitHub Actions every 15 minutes — no laptop needed.
Sends ntfy.sh push notifications on restock events.
"""

import json
import os
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone

# ── Configuration ─────────────────────────────────────────────────────────────
NTFY_TOPIC   = os.environ.get("NTFY_TOPIC", "").strip()
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
WATCHLIST    = os.path.join(SCRIPT_DIR, "watchlist.json")
STATE_FILE   = os.path.join(SCRIPT_DIR, "state.json")

# Realistic browser headers to avoid 403/bot-detection
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection":      "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control":   "max-age=0",
}

# Ordered: out-of-stock phrases take priority over in-stock phrases
OUT_OF_STOCK_PHRASES = [
    "out of stock",
    "out-of-stock",
    "sold out",
    "currently unavailable",
    "not available",
    "notify me when available",
    "notify when available",
    "join the waitlist",
    "coming soon",
    "temporarily unavailable",
    "no longer available",
    "item is unavailable",
    "product is unavailable",
    "आउट ऑफ स्टॉक",          # Hindi
]

IN_STOCK_PHRASES = [
    "add to cart",
    "add to bag",
    "add to basket",
    "buy now",
    "buy it now",
    "in stock",
    "in-stock",
    "ships from",
    "ships in",
    "usually ships",
    "select quantity",
    "proceed to checkout",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg: str):
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
    print(f"[{ts}] {msg}")


def load_json(path: str, default):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path: str, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ── Stock Detection ────────────────────────────────────────────────────────────

def check_stock(product: dict) -> str:
    """
    Returns one of: 'in-stock' | 'out-of-stock' | 'unknown'
    Strategy priority:
      1. Custom CSS selector  (if provided)
      2. Out-of-stock keyword scan
      3. In-stock keyword scan
    """
    url             = product["url"]
    custom_selector = product.get("custom_selector") or product.get("customSelector")

    try:
        session  = requests.Session()
        response = session.get(url, headers=HEADERS, timeout=30, allow_redirects=True)

        if response.status_code == 404:
            log(f"  ⚠ 404 Not Found — skipping")
            return "unknown"

        if response.status_code != 200:
            log(f"  ⚠ HTTP {response.status_code} — skipping")
            return "unknown"

        soup = BeautifulSoup(response.text, "lxml")

        # ── Strategy 1: Custom CSS selector ─────────────────────────────────
        if custom_selector:
            element = soup.select_one(custom_selector)
            result  = "in-stock" if element else "out-of-stock"
            log(f"  CSS selector '{custom_selector}' → element {'FOUND' if element else 'NOT FOUND'} → {result}")
            return result

        # ── Strategy 2 & 3: Keyword scan ────────────────────────────────────
        # Strip scripts/styles before text extraction
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        page_text = soup.get_text(" ", strip=True).lower()

        for phrase in OUT_OF_STOCK_PHRASES:
            if phrase in page_text:
                log(f"  OOS phrase matched: '{phrase}'")
                return "out-of-stock"

        for phrase in IN_STOCK_PHRASES:
            if phrase in page_text:
                log(f"  In-stock phrase matched: '{phrase}'")
                return "in-stock"

        log("  No decisive phrases found → unknown")
        return "unknown"

    except requests.exceptions.Timeout:
        log("  ⚠ Request timed out")
        return "unknown"
    except requests.exceptions.ConnectionError as e:
        log(f"  ⚠ Connection error: {e}")
        return "unknown"
    except Exception as e:
        log(f"  ⚠ Unexpected error: {e}")
        return "unknown"


# ── Notifications ──────────────────────────────────────────────────────────────

def send_ntfy(title: str, message: str, url: str = ""):
    if not NTFY_TOPIC:
        log("  ntfy: NTFY_TOPIC secret not set — skipping push")
        return

    headers = {
        "Title":    title,
        "Priority": "urgent",
        "Tags":     "tada,shopping_cart,white_check_mark",
    }
    if url:
        headers["Click"] = url   # Tap notification → open product page

    try:
        r = requests.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=message.encode("utf-8"),
            headers=headers,
            timeout=15,
        )
        if r.ok:
            log(f"  ✅ ntfy push sent OK → topic: {NTFY_TOPIC}")
        else:
            log(f"  ❌ ntfy HTTP {r.status_code}: {r.text[:200]}")
    except Exception as e:
        log(f"  ❌ ntfy error: {e}")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    log("=" * 55)
    log("StockSentry Cloud Checker — GitHub Actions")
    log("=" * 55)

    watchlist = load_json(WATCHLIST, [])
    state     = load_json(STATE_FILE, {})

    if not watchlist:
        log("⚠ watchlist.json is empty — nothing to check.")
        log("Edit cloud-checker/watchlist.json to add products.")
        return

    active = [p for p in watchlist if p.get("active", True)]
    log(f"Products: {len(watchlist)} total, {len(active)} active\n")

    new_state = dict(state)  # carry over inactive items' state

    for product in watchlist:
        pid  = str(product["id"])
        name = product.get("name", "Unknown Product")
        site = product.get("site", product["url"])

        if not product.get("active", True):
            log(f"[SKIP]  {name} — paused")
            continue

        log(f"[CHECK] {name}")
        log(f"        {site}")

        new_status = check_stock(product)
        old_status = state.get(pid, "unknown")

        status_emoji = {"in-stock": "🟢", "out-of-stock": "🔴", "unknown": "🟡"}
        log(
            f"        {status_emoji.get(old_status,'❓')} {old_status}  →  "
            f"{status_emoji.get(new_status,'❓')} {new_status}"
        )

        # 🎉 Restock event: was OOS, now IS
        if old_status == "out-of-stock" and new_status == "in-stock":
            log(f"        🎉 RESTOCK DETECTED — sending notification!")
            send_ntfy(
                title   = f"🛒 Back In Stock: {name}",
                message = (
                    f"{name} is now AVAILABLE on {site}!\n"
                    f"Tap to open → {product['url']}"
                ),
                url     = product["url"],
            )

        new_state[pid] = new_status

        # Polite delay between requests
        time.sleep(3)

    log("\n" + "=" * 55)
    save_json(STATE_FILE, new_state)
    log("✅ State saved to state.json")
    log("=" * 55)


if __name__ == "__main__":
    main()
