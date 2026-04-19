# ☁️ StockSentry Cloud Checker — Setup Guide

Your stock tracker now runs **24/7 on GitHub's servers**, even when your laptop is off.

---

## How It Works

```
GitHub Actions (cron every 15 min)
       ↓
  checker.py fetches each product URL
       ↓
  Detects Out-of-Stock → In-Stock transition
       ↓
  Sends push notification via ntfy.sh → Your Phone
       ↓
  Commits updated state.json back to repo
```

---

## Step-by-Step Setup

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Add StockSentry cloud checker"
git remote add origin https://github.com/YOUR_USERNAME/stock-notify.git
git push -u origin main
```

---

### Step 2: Add ntfy Topic Secret

Use the same ntfy topic you set in the Chrome extension.

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `NTFY_TOPIC`
4. Value: your topic (e.g., `stocksentry-sudhir`)
5. Save

---

### Step 3: Edit watchlist.json

Edit `cloud-checker/watchlist.json` to add your real product URLs.
Set `"active": true` for each product you want to monitor.

---

### Step 4: Verify

GitHub repo → **Actions** tab → see the workflow running every 15 min.
To test immediately: click the workflow → **"Run workflow"** (manual trigger button).

---

## Custom CSS Selectors

For sites where keywords don't work, inspect the "Add to Cart" button and grab its CSS selector:

```json
"custom_selector": "#add-to-cart-button"
```

If that element exists on the page = product is in stock.

---

## Files

```
stock notify/
├── cloud-checker/
│   ├── checker.py        - Main script (runs on GitHub every 15 min)
│   ├── watchlist.json    - Your products (edit this!)
│   ├── state.json        - Auto-managed state
│   └── requirements.txt  - Python deps
└── .github/workflows/
    └── stock_check.yml   - Cron schedule
```
