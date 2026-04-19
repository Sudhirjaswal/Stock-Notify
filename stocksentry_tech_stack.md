# StockSentry — Tech Stack & Recruiter Guide

## Project In One Line
> A **Chrome Browser Extension** that monitors e-commerce product pages in the background and sends **real-time push + SMS notifications** when an out-of-stock item comes back in stock — for **any website**, without needing a login.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                          │
│                                                              │
│  ┌─────────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   Popup UI      │   │  Background  │   │   Content    │ │
│  │  (React 18 +    │◄──│  Service     │──►│   Script     │ │
│  │  Tailwind CSS)  │   │  Worker      │   │  (Vanilla JS)│ │
│  └─────────────────┘   └──────────────┘   └──────────────┘ │
│         │                     │                             │
│  chrome.storage.local  chrome.alarms API                    │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
     https://ntfy.sh/{topic}     https://api.twilio.com
     (Free mobile push)          (SMS via Twilio REST API)
```

---

## Full Tech Stack — Role of Each Layer

### 1. Language — JavaScript (ES2022)
- **Used everywhere** — popup, background, content scripts
- Why ES2022? Arrow functions, async/await, optional chaining, URLSearchParams, btoa() — modern, no transpilation headaches
- **Recruiter answer:** *"We used vanilla JavaScript ES2022 as the core language because browser extensions run natively in the browser's JS engine — no need for TypeScript overhead in an MVP."*

---

### 2. Framework — React 18 (Popup UI only)
- **File:** `src/App.jsx`
- **Role:** Builds the 350×500px extension popup — the UI the user sees when they click the extension icon
- Manages **state** (watchlist, settings, loading states) with `useState` and `useEffect`
- Listens for real-time storage changes with `chrome.storage.onChanged` → auto-refreshes UI when background worker updates stock status
- **Recruiter answer:** *"We used React 18 for the popup UI because it gave us component-based architecture and hooks-based state management to handle complex UI states like live status updates, settings panels, and form interactions cleanly."*

---

### 3. Styling — Tailwind CSS v3
- **Files:** `src/index.css`, `tailwind.config.js`, `postcss.config.js`
- **Role:** All visual styling — layout, colors, typography, hover states, animations
- Utility-first: classes like `bg-indigo-600`, `rounded-xl`, `animate-pulse` applied directly in JSX
- **Recruiter answer:** *"We chose Tailwind CSS v3 for rapid, consistent UI development. Its utility-first approach let us build a polished, professional popup UI without writing custom CSS files — every design decision is co-located with the component markup."*

---

### 4. Build Tool — Vite
- **File:** `vite.config.js`
- **Role:** Bundles the React app + Tailwind into production-ready files in the `dist/` folder — which Chrome loads as the extension
- Fast HMR during development at `localhost:5173`
- **Recruiter answer:** *"We used Vite as our build tool because it provides near-instant dev server startup and optimized production builds. For a Chrome extension, Vite compiles React/JSX and Tailwind CSS into plain HTML/JS/CSS that Chrome can load directly."*

---

### 5. Chrome Extension APIs (Manifest V3)
These are browser-native APIs — not libraries:

| API | Role |
|---|---|
| `chrome.storage.local` | Persists watchlist and settings across browser restarts |
| `chrome.alarms` | Schedules background polling every 1 minute |
| `chrome.notifications` | Native OS desktop pop-up notifications |
| `chrome.tabs` | Opens hidden background tabs to load and inspect product pages |
| `chrome.runtime.sendMessage` | Popup ↔ Background worker communication |
| `chrome.storage.onChanged` | Popup auto-refreshes when background updates stock status |

- **Recruiter answer:** *"We built on Manifest V3 — Google's current extension standard. MV3 uses service workers instead of persistent background pages, and chrome.alarms instead of setInterval — more battery-efficient and Chrome-compliant."*

---

### 6. Background Service Worker (Vanilla JS)
- **File:** `public/background.js`
- **Role:** The engine — runs silently even when popup is closed
- Opens hidden tabs → waits for full page load → messages content script → reads stock status → closes tab
- Detects `out-of-stock → in-stock` transitions → fires notifications
- Calls ntfy.sh and Twilio APIs
- **Recruiter answer:** *"The background service worker is the heart of StockSentry. In MV3, service workers are ephemeral — they wake up on events and go dormant when idle. That's why we wrapped all chrome.storage reads in Promises to ensure async/await chains work correctly across wakeup cycles."*

---

### 7. Content Script (Vanilla JS)
- **File:** `public/content.js`
- **Role:** Injected into every product page. Reads the **live rendered DOM** after JS frameworks (Vue, React) have finished painting
- Has a **site adapter system**: specific selectors for Amazon, Flipkart, Myntra, Amul + generic keyword fallback for any other site
- **Recruiter answer:** *"We used a pluggable content script adapter pattern. Each adapter knows the exact DOM selectors for its site. If no adapter matches, we fall back to scanning the rendered page text for keywords like 'Add to Cart' or 'Sold Out' — making it work on virtually any e-commerce site including Vue/React SPAs."*

---

### 8. ntfy.sh (Free Push Notification Service)
- **Role:** Delivers real-time push notifications to the user's phone without a backend
- Extension POSTs to `https://ntfy.sh/{user-topic}` — plain HTTP, no account needed
- **Recruiter answer:** *"For mobile push without a backend server, we integrated ntfy.sh — an open-source push notification relay. The extension sends a plain HTTP POST and the user's phone receives it via the ntfy app. Zero server infrastructure required."*

---

### 9. Twilio REST API (SMS)
- **Role:** Sends SMS to the user's phone when a stock-in event is detected
- Uses HTTP Basic Auth with `application/x-www-form-urlencoded` POST to `api.twilio.com`
- Credentials stored in `chrome.storage.local` (never shipped in code)
- **Recruiter answer:** *"We integrated Twilio's Programmable Messaging REST API for SMS. The background service worker makes an authenticated API call directly. Credentials live in chrome.storage.local — not in the extension source code — following security best practices."*

---

## Development Approach

### SRS-First
Started from a full Software Requirements Specification defining MVP scope, user classes, site adapters, and phased roadmap.

### Progressive Enhancement
MVP (Chrome, 3 sites, local storage) → ntfy push → Twilio SMS. Each layer independently testable.

### Separation of Concerns
- **Popup UI (React)** = what the user sees and interacts with
- **Background Worker (JS)** = polls silently, fires notifications
- **Content Script (JS)** = reads live page DOM
- They never talk to each other directly — only through `chrome.storage` and `chrome.runtime.sendMessage`

### Real DOM Inspection over fetch()
Modern SPAs (like Amul's Vue.js shop) render content via JavaScript — a raw `fetch()` only sees an empty HTML shell. We open real hidden tabs so the page fully renders before the content script inspects it.

### Generic-First Adapter System
3-layer detection:
1. Custom CSS selector (user-provided)
2. Site-specific adapter (Amazon, Flipkart, Myntra, Amul)
3. Generic keyword heuristic (any site)

---

## Quick Reference Card for Interviews

| Tech | What it does in this project |
|---|---|
| **JavaScript ES2022** | Core language for all extension logic |
| **React 18** | UI framework for the extension popup |
| **Tailwind CSS v3** | Utility-first styling for the popup UI |
| **Vite** | Bundles React + Tailwind into Chrome-loadable files |
| **Chrome MV3 APIs** | Storage, alarms, notifications, tabs, messaging |
| **Service Worker** | Background engine — polls sites, fires notifications |
| **Content Script** | Reads live rendered DOM to detect stock status |
| **ntfy.sh** | Free HTTP-based mobile push notification relay |
| **Twilio REST API** | SMS delivery via authenticated API call |
