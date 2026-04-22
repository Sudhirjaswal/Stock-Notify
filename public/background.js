console.log("StockSentry Background Worker Started");

// Polling alarm — every 1 minute
chrome.alarms.create("poll-stock", { periodInMinutes: 1 });

// === Read chrome.storage as a proper Promise ===
function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

// === BROWSER + MOBILE NOTIFICATION ===
async function sendNotification(title, message) {
  // 1. Browser desktop notification (always)
  chrome.notifications.create(Math.random().toString(), {
    type: "basic",
    iconUrl: "icon.png",
    title,
    message
  });

  // 2. Mobile push via ntfy.sh — read settings with proper Promise
  try {
    const settings = await storageGet(['ntfyTopic', 'ntfyEnabled']);
    console.log("StockSentry: ntfy settings →", settings);

    if (settings.ntfyEnabled && settings.ntfyTopic) {
      const response = await fetch(`https://ntfy.sh/${settings.ntfyTopic}`, {
        method: 'POST',
        headers: {
          'Title': title,           // plain ASCII title (no emoji here)
          'Priority': 'high',
          'Tags': 'tada,white_check_mark'
        },
        body: message
      });
      if (response.ok) {
        console.log("StockSentry: ntfy push sent OK to", settings.ntfyTopic);
      } else {
        console.error("StockSentry: ntfy returned HTTP", response.status);
      }
    } else {
      console.log("StockSentry: ntfy not enabled or no topic set. Skipping mobile push.");
    }
  } catch (e) {
    console.error("StockSentry: ntfy push error", e);
  }

  // 3. Mobile SMS via Twilio
  try {
    const twilioSettings = await storageGet(['smsEnabled', 'twilioSid', 'twilioToken', 'twilioFrom', 'twilioTo']);
    if (twilioSettings.smsEnabled && twilioSettings.twilioSid && twilioSettings.twilioToken && twilioSettings.twilioFrom && twilioSettings.twilioTo) {
      console.log("StockSentry: Sending SMS via Twilio...");
      const body = new URLSearchParams({
        To: twilioSettings.twilioTo.trim(),
        From: twilioSettings.twilioFrom.trim(),
        Body: `StockSentry: ${title} - ${message}`
      });
      
      const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSettings.twilioSid.trim()}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioSettings.twilioSid.trim()}:${twilioSettings.twilioToken.trim()}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });
      
      if (smsResponse.ok) {
        console.log("StockSentry: SMS sent successfully!");
      } else {
        const err = await smsResponse.json();
        console.error("StockSentry: Twilio error", err);
      }
    }
  } catch (e) {
    console.error("StockSentry: Twilio SMS error", e);
  }
}

// === CHECK A SINGLE PRODUCT via content script injection ===
async function checkProductViaTab(product) {
  return new Promise(async (resolve) => {
    let tab = null;
    try {
      tab = await chrome.tabs.create({ url: product.url, active: false });

      // Wait for tab to fully load
      await new Promise((res) => {
        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            res();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
        // Safety timeout: 20s for SPAs like Amul
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          res();
        }, 20000);
      });

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "CHECK_STOCK",
        customSelector: product.customSelector || null
      });

      resolve(response?.status || "unknown");
    } catch (err) {
      console.error(`StockSentry: Error checking ${product.url}`, err);
      resolve("unknown");
    } finally {
      if (tab?.id) {
        try { await chrome.tabs.remove(tab.id); } catch (e) {}
      }
    }
  });
}

// === POLL ALL PRODUCTS ===
async function runPoll() {
  console.log("StockSentry: Running poll...");

  // Use Promise-based storage read so async/await works correctly
  const data = await storageGet(["watchlist"]);
  const products = data.watchlist || [];
  const updatedProducts = [];
  let stateChanged = false;

  for (let product of products) {
    if (!product.active) {
      updatedProducts.push(product);
      continue;
    }

    const newStatus = await checkProductViaTab(product);
    console.log(`StockSentry: ${product.site} -> ${newStatus} (was: ${product.status})`);

    // Fire notification on Out-of-Stock → In-Stock transition
    if (product.status === "out-of-stock" && newStatus === "in-stock") {
      console.log("StockSentry: Transition detected! Sending notifications...");
      await sendNotification(
        "Back In Stock!",
        `${product.name} is now available on ${product.site}!`
      );
    }

    if (product.status !== newStatus) stateChanged = true;

    product.status      = newStatus;
    product.lastChecked = new Date().toLocaleTimeString();
    stateChanged = true;

    updatedProducts.push(product);
  }

  if (stateChanged) {
    chrome.storage.local.set({ watchlist: updatedProducts });
  }
}

// === ALARM LISTENER ===
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "poll-stock") runPoll();
});

// === POPUP MESSAGE: FORCE IMMEDIATE CHECK ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "FORCE_CHECK") {
    runPoll();
    sendResponse({ status: "checking" });
  }
});

// === SET EXTENSION ICON ON INSTALL ===
chrome.runtime.onInstalled.addListener(() => {
  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(0, 0, 16, 16);
  chrome.action.setIcon({ imageData: ctx.getImageData(0, 0, 16, 16) });
});
