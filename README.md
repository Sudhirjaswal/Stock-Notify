# StockSentry 🔔

> **Never miss a restock again.** StockSentry monitors any e-commerce product page and sends instant push notifications to your phone the moment an out-of-stock item becomes available.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

---

## 🤔 Why Was This Built?

Anyone who's tried to buy a high-demand product online knows the pain:

- PS5 restocks sell out in **under 2 minutes**
- You're refreshing the page manually every few hours
- You miss the restock because you were asleep, in class, or your laptop was off

**StockSentry solves this.** It watches the page for you — and the moment a product comes back in stock, it sends a push notification straight to your phone.

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

---

## 🏗️ Architecture

StockSentry runs entirely within your browser locally:

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
| Mobile Push | ntfy.sh HTTP API | Free push notifications, no account |
| SMS (optional) | Twilio REST API | SMS fallback notifications |

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

## 📱 Mobile Notifications Setup (ntfy.sh)

Free mobile push notifications — no account, no subscription.

1. Download the **ntfy** app:
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
   - [iOS (App Store)](https://apps.apple.com/app/ntfy/id1625396347)

2. Open app → tap **"+"** → enter a unique topic name (e.g. `stocksentry-yourname`) → Subscribe

3. **For the Chrome Extension:** click ⚙️ Settings → enter your topic → toggle **Enable** → Save → **Test**

---

## 🔔 SMS Alerts Setup (Twilio)

StockSentry integrates directly with the [Twilio API](https://www.twilio.com/) to send literal SMS messages to your phone without exposing any keys to a backend server. 

1. Create a free Twilio account to get your **Account SID** and **Auth Token**.
2. Claim a free Twilio Phone Number.
3. Open the StockSentry **Settings** ⚙️ and enter your credentials.
4. Add your personal phone number to the "To" field (ensure it is verified in Twilio if using a trial account).
5. Toggle **Enable** → Save → **Test SMS**.

> **Note:** StockSentry runs 100% locally. Your Twilio Auth Token is strictly saved to your local browser's `chrome.storage.local` and is never sent to any external server other than the official Twilio API.

## 🧠 Architecture & Design Philosophy (Why Local?)

You might be wondering: *"Why is this a Chrome Extension that only runs when my laptop is awake, instead of a 24/7 Cloud SaaS?"*

Building this as a client-side extension was a deliberate architectural decision:
1. **Zero Server Costs:** Running 24/7 web scrapers against Amazon or Apple on cloud servers like AWS or Heroku gets extremely expensive very quickly. 
2. **Avoiding Anti-Bot Captchas:** E-commerce sites aggressively block cloud IP addresses. Browsers execute JavaScript and carry real user cookies, naturally bypassing most anti-bot protections without needing expensive proxy networks.
3. **Privacy First:** By keeping everything locally in `chrome.storage.local`, your Twilio API keys and personal phone numbers never touch an external database.
4. **The Goal:** This tool is designed to work as a silent productivity companion *while you are using your computer*, ensuring you don't miss a drop while you are distracted with work, rather than acting as a large-scale data aggregation server.

---

## 🎯 Custom CSS Selector (Advanced)

For sites where automatic detection doesn't work precisely:

1. Open the product page in Chrome
2. Right-click **"Add to Cart"** → **Inspect**
3. Find a unique CSS class or ID (e.g. `#add-to-cart-button`)
4. Add it to your watchlist entry in the extension.

If that element **exists** on the page → **In Stock**. If it's **absent** → **Out of Stock**.

---

## 🌐 Supported Sites

| Site | Chrome Extension |
|---|---|
| Amazon.in | ✅ Built-in adapter |
| Flipkart | ✅ Built-in adapter |
| Myntra | ✅ Built-in adapter |
| Amul Shop | ✅ Built-in adapter (SPA-aware) |
| Any other site | ✅ Generic fallback |

---

## 🔐 Security — What Goes on GitHub (and What Doesn't)

| Data | Storage | Goes to GitHub? |
|---|---|---|
| Twilio credentials | Chrome `localStorage` only | ❌ Never |
| Source code | `.js` / `.jsx` files | ✅ No secrets hardcoded |

**Rule of thumb:** If it's a password, token, or API key → it goes in Chrome local storage. Never in code.

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
