console.log("StockSentry content script loaded on:", window.location.hostname);

// === SITE ADAPTERS ===
// Each adapter knows which keywords or selectors to check for its specific site.
// The generic fallback handles everything else by scanning the live rendered DOM text.

const SITE_ADAPTERS = {
  "amazon.in": () => {
    if (document.querySelector("#outOfStock")) return "out-of-stock";
    if (document.querySelector("#add-to-cart-button")) return "in-stock";
    return null; // fall through to generic
  },
  "flipkart.com": () => {
    if (document.querySelector("._2P_LDn")) return "out-of-stock"; // "Notify Me" button class
    if (document.querySelector(".yhB1nd")) return "in-stock"; // "Add to Cart" button
    return null;
  },
  "myntra.com": () => {
    if (document.querySelector(".size-buttons-out-of-stock")) return "out-of-stock";
    if (document.querySelector(".pdp-add-to-bag")) return "in-stock";
    return null;
  },
  "shop.amul.com": () => {
    // Confirmed selector from live DOM inspection: <a class="... add-to-cart ...">Add to Cart</a>
    const addToCart = document.querySelector("a.add-to-cart");
    if (addToCart) return "in-stock";
    // Amul shows a pincode prompt when no location is set — treat as unknown, not out-of-stock
    const pincodeModal = document.querySelector(".pincode-modal, .delivery-pincode, [class*='pincode']");
    if (pincodeModal) return "unknown";
    // Explicit out-of-stock text on page
    const bodyText = document.body.innerText.toLowerCase();
    if (bodyText.includes("out of stock") || bodyText.includes("notify me")) return "out-of-stock";
    return null;
  }
};

// === GENERIC FALLBACK ===
// Scans the fully rendered DOM text — works on any site
function genericCheck(customSelector) {
  // If user gave a custom selector, use it
  if (customSelector) {
    const el = document.querySelector(customSelector);
    if (el) return "in-stock";
    return "out-of-stock";
  }

  // Scan visible page text (rendered by JS frameworks too)
  const bodyText = document.body.innerText.toLowerCase();

  const outKeywords = ["out of stock", "sold out", "currently unavailable", "notify me when available", "coming soon", "temporarily unavailable"];
  const inKeywords  = ["add to cart", "add to bag", "buy now", "add to basket", "shop now", "order now"];

  if (outKeywords.some(k => bodyText.includes(k))) return "out-of-stock";
  if (inKeywords.some(k  => bodyText.includes(k)))  return "in-stock";

  return "unknown";
}

// === MAIN CHECK FUNCTION ===
function checkStock(customSelector) {
  const hostname = window.location.hostname.replace("www.", "");

  for (const [domain, adapterFn] of Object.entries(SITE_ADAPTERS)) {
    if (hostname.includes(domain)) {
      const result = adapterFn();
      if (result !== null) return result; // adapter gave a definitive answer
      break; // adapter returned null → fall through to generic
    }
  }

  return genericCheck(customSelector);
}

// === MESSAGE LISTENER ===
// Background worker sends CHECK_STOCK, we reply with live DOM result
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CHECK_STOCK") {
    // Wait for SPA (Vue/React) to finish rendering — Amul needs ~4s
    const delay = window.location.hostname.includes("amul") ? 4000 : 2000;
    setTimeout(() => {
      const status = checkStock(request.customSelector || null);
      console.log(`StockSentry: ${window.location.hostname} → ${status}`);
      sendResponse({ status });
    }, delay);

    return true; // keeps the message channel open for async response
  }
});
