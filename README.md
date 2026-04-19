# StockSentry 🔔

> **Never miss a restock again.** StockSentry monitors any e-commerce product page 24/7 and sends instant push notifications to your phone the moment an out-of-stock item becomes available — even when your laptop is off.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Cloud_Checker-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

---

## 🤔 Why Was This Built?

Anyone who's tried to buy a high-demand product online knows the pain:

- PS5 restocks sell out in **under 2 minutes**
- You're refreshing the page manually every few hours
- You miss the restock because you were asleep, in class, or your laptop was off

**StockSentry solves this.** It watches the page for you — 24 hours a day, 7 days a week — and the moment a product comes back in stock, it sends a push notification straight to your phone.

No subscriptions. No accounts. No paywalls. **Completely free.**

---

## ✨ Features

### Chrome Extension (Browser-side)
- 🛒 **Track any product URL** — paste any e-commerce link to start monitoring
- 🔍 **Smart stock detection** — keyword scan + custom CSS selector support
- 🌐 **Works on any website** — Amazon.in, Flipkart, Myntra, Amul, and all others via generic fallback
- 🖥️ **Desktop notifications** — native OS notification on restock
- 📱 **Mobile push** — via free [ntfy.sh](https://ntfy.sh) app
- 📩 **SMS alerts** — via Twilio (optional, paid)
- ⚡ **Simulate restock** — test your full notification pipeline without waiting
- ⏸️ **Pause / Resume** — control monitoring per product
- 💾 **No account needed** — everything stored locally in Chrome storage

### GitHub Actions Cloud Checker (24/7, laptop-off)
- ☁️ **Runs on GitHub's servers** — no laptop, no server needed
- ⏰ **Polls every 15 minutes** — automatic, around the clock
- 🔔 **Sends ntfy.sh push** — tapping the notification opens the product page
- 📝 **Simple JSON watchlist** — just edit a file and push
- 🆓 **100% free** — well within GitHub's 2,000 free minutes/month

---

## 🏗️ Architecture

StockSentry has **two independent layers** that work together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LAYER 1: CHROME EXTENSION                       │
│  (Works when browser is open)                                       │
│                                                                     │
│  ┌──────────────┐   ┌─────────────────┐   ┌──────────────────────┐ │
│  │  Popup UI    │   │  Background     │   │  Content Script      │ │
│  │  (React 18)  │◄──│  Service Worker │──►│  (DOM reader)        │ │
│  │  + Tailwind  │   │  chrome.alarms  │   │  Vanilla JS          │ │
│  └──────────────┘   └─────────────────┘   └──────────────────────┘ │
│         │                    │                                      │
│  chrome.storage.local    Poll every 1 min                           │
└─────────────────────────────────────────────────────────────────────┘
                               │
               ┌───────────────┴──────────────────┐
               ▼                                  ▼
     ntfy.sh push notification         Chrome OS desktop notification


┌─────────────────────────────────────────────────────────────────────┐
│              LAYER 2: GITHUB ACTIONS CLOUD CHECKER                  │
│  (Works 24/7 — even when laptop is off)                             │
│                                                                     │
│  GitHub cron (*/15 * * * *)                                         │
│       ↓                                                             │
│  checker.py — fetches product URLs via requests + BeautifulSoup     │
│       ↓                                                             │
│  Detects out-of-stock → in-stock transition                         │
│       ↓                                                             │
│  Sends ntfy.sh push → Your Phone 📱                                 │
│       ↓                                                             │
│  Commits updated state.json back to repo                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | React 18 | Chrome extension popup |
| Styling | Tailwind CSS v3 | Extension UI design |
| Build Tool | Vite | Bundles React → Chrome extension |
| Extension Standard | Chrome Manifest V3 | Background worker, alarms, storage |
| Background Polling | Chrome Service Worker | Silent tab-based DOM checking |
| DOM Detection | Vanilla JS Content Script | Reads live-rendered page stock status |
| Cloud Poller | Python 3.11 | GitHub Actions stock checker |
| HTTP Fetching | requests + BeautifulSoup | Parse product pages server-side |
| Mobile Push | ntfy.sh HTTP API | Free push notifications, no account |
| SMS (optional) | Twilio REST API | SMS fallback notifications |
| Scheduling | GitHub Actions cron | 24/7 cloud execution |

---

## 📦 Project Structure

```
stock-notify/
│
├── src/                        # Chrome Extension — React popup UI
│   ├── App.jsx                 # Main UI — watchlist, settings, add form
│   ├── index.css               # Tailwind directives
│   └── main.jsx                # React entry point
│
├── public/                     # Chrome Extension — background & content
│   ├── manifest.json           # MV3 manifest
│   ├── background.js           # Service worker — polling engine
│   └── content.js              # DOM reader — stock detection logic
│
├── dist/                       # Built extension (load this into Chrome)
│
├── cloud-checker/              # GitHub Actions — 24/7 cloud checker
│   ├── checker.py              # Main Python polling script
│   ├── watchlist.json          # Your product list (edit this!)
│   ├── state.json              # Auto-managed stock state
│   └── requirements.txt        # Python dependencies
│
├── .github/
│   └── workflows/
│       └── stock_check.yml     # GitHub Actions cron schedule
│
├── .gitignore                  # Sensitive files excluded from git
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🚀 Installation — Chrome Extension

### Prerequisites
- Node.js 18+
- Google Chrome

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/stock-notify.git
cd stock-notify

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

Then load into Chrome:
1. Open `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load Unpacked**
4. Select the `dist/` folder

The StockSentry icon will appear in your Chrome toolbar.

---

## ☁️ Setup — GitHub Actions Cloud Checker (24/7)

This runs on GitHub's free servers every 15 minutes — no laptop needed.

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stock-notify.git
git push -u origin main
```

### Step 2: Add Your ntfy Topic as a Secret

> ⚠️ **Never put secrets directly in code or commit `.env` files to GitHub.**
> GitHub Secrets are encrypted — even you can't read them back.

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. **Name:** `NTFY_TOPIC`
4. **Value:** your ntfy topic name (e.g. `stocksentry-sudhir`)
5. Click **"Add secret"**

### Step 3: Edit Your Watchlist

Open `cloud-checker/watchlist.json` and add your products:

```json
[
  {
    "id": 1,
    "name": "Sony PlayStation 5",
    "site": "amazon.in",
    "url": "https://www.amazon.in/dp/B08FC5L3RG",
    "active": true,
    "custom_selector": null
  },
  {
    "id": 2,
    "name": "Amul Protein Shake",
    "site": "shop.amul.com",
    "url": "https://shop.amul.com/en/product/...",
    "active": true,
    "custom_selector": null
  }
]
```

| Field | Description |
|---|---|
| `id` | Unique number — never duplicate |
| `name` | Name shown in push notifications |
| `site` | Short site name (display only) |
| `url` | Full product page URL |
| `active` | `true` = monitor, `false` = pause |
| `custom_selector` | CSS selector — if element exists on page = In Stock |

```bash
git add cloud-checker/watchlist.json
git commit -m "Add products to watchlist"
git push
```

### Step 4: Verify It's Running

- GitHub repo → **Actions** tab → **"StockSentry — Cloud Stock Checker"**
- It runs automatically every 15 minutes
- **To test right now:** click the workflow → **"Run workflow"** button (top right)
- Check the logs — you'll see each product being checked in real time

---

## 📱 Mobile Notifications Setup (ntfy.sh)

Free mobile push notifications — no account, no subscription.

1. Download the **ntfy** app:
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
   - [iOS (App Store)](https://apps.apple.com/app/ntfy/id1625396347)

2. Open app → tap **"+"** → enter a unique topic name (e.g. `stocksentry-yourname`) → Subscribe

3. **For the Chrome Extension:** click ⚙️ Settings → enter your topic → toggle **Enable** → Save → **Test**

4. **For GitHub Actions:** add the same topic as the `NTFY_TOPIC` GitHub Secret (see Step 2 above)

---

## 🎯 Custom CSS Selector (Advanced)

For sites where automatic detection doesn't work precisely:

1. Open the product page in Chrome
2. Right-click **"Add to Cart"** → **Inspect**
3. Find a unique CSS class or ID (e.g. `#add-to-cart-button`)
4. Add it to your watchlist entry:
   ```json
   "custom_selector": "#add-to-cart-button"
   ```

If that element **exists** on the page → **In Stock**. If it's **absent** → **Out of Stock**.

---

## 🌐 Supported Sites

| Site | Chrome Extension | Cloud Checker |
|---|---|---|
| Amazon.in | ✅ Built-in adapter | ✅ Keyword scan |
| Flipkart | ✅ Built-in adapter | ✅ Keyword scan |
| Myntra | ✅ Built-in adapter | ✅ Keyword scan |
| Amul Shop | ✅ Built-in adapter (SPA-aware) | ✅ Keyword scan |
| Any other site | ✅ Generic fallback | ✅ Generic fallback |

> **Note:** The cloud checker uses server-side HTML scraping. Sites that render stock status **exclusively via JavaScript** may return `unknown`. In this case, use a `custom_selector` targeting an HTML element that is always present in the server response.

---

## 🔐 Security — What Goes on GitHub (and What Doesn't)

| Data | Storage | Goes to GitHub? |
|---|---|---|
| ntfy topic | GitHub Secret (encrypted) | ❌ Never visible |
| Twilio credentials | Chrome `localStorage` only | ❌ Never |
| Product URLs | `watchlist.json` | ✅ Safe (just URLs) |
| Stock states | `state.json` | ✅ Safe (just strings) |
| Source code | `.js` / `.py` / `.jsx` files | ✅ No secrets hardcoded |

**Rule of thumb:** If it's a password, token, or API key → it goes in GitHub Secrets or Chrome local storage. Never in code.

---

## 📋 Status Badges (Extension)

| Badge | Meaning |
|---|---|
| 🟢 In Stock | Product is currently available |
| 🔴 Out of Stock | Unavailable — monitoring active |
| 🔵 Checking... | First check in progress |
| 🟡 Unknown | Status couldn't be determined |

---

## ✅ Roadmap

- [x] Chrome Extension MVP — watchlist, polling, desktop notifications
- [x] Mobile push via ntfy.sh
- [x] SMS via Twilio
- [x] Custom CSS selector support
- [x] SPA support (Vue/React rendered pages)
- [x] GitHub Actions 24/7 cloud checker
- [ ] Firefox & Edge support
- [ ] Dark mode
- [ ] Export / Import watchlist
- [ ] Quiet hours (no alerts during sleep)
- [ ] Telegram bot notifications

---

## 🤝 Contributing

Pull requests are welcome! To add a new site adapter to the Chrome extension:

1. Open `public/content.js`
2. Add your adapter to `SITE_ADAPTERS`:
```js
"yoursite.com": () => {
  const addToCart = document.querySelector(".your-selector");
  if (addToCart) return "in-stock";
  return null; // falls through to generic
}
```
3. Submit a PR

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 👤 Author

Built to solve a real problem — because manually refreshing product pages at 2 AM is no way to live.

> *"The best tools are the ones that work quietly in the background so you don't have to."*
