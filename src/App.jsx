import { useState, useEffect } from 'react';
import { Settings, Plus, Play, Pause, Trash2, ExternalLink, BellRing, X, Smartphone, Bell, CheckCircle, FlaskConical, Zap } from 'lucide-react';

// ─── Toggle Switch helper ───────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${value ? 'bg-indigo-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────
function SettingsPanel({ onClose }) {
  // ntfy state
  const [ntfyTopic, setNtfyTopic] = useState('');
  const [ntfyEnabled, setNtfyEnabled] = useState(false);

  // SMS / Twilio state
  const [smsEnabled, setSmsEnabled]       = useState(false);
  const [twilioSid, setTwilioSid]         = useState('');
  const [twilioToken, setTwilioToken]     = useState('');
  const [twilioFrom, setTwilioFrom]       = useState('');
  const [twilioTo, setTwilioTo]           = useState('');

  const [ntfyStatus, setNtfyStatus] = useState(null);
  const [smsStatus, setSmsStatus]   = useState(null);

  useEffect(() => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(['ntfyTopic', 'ntfyEnabled', 'smsEnabled', 'twilioSid', 'twilioToken', 'twilioFrom', 'twilioTo'], (res) => {
        setNtfyTopic(res.ntfyTopic || '');
        setNtfyEnabled(res.ntfyEnabled || false);
        setSmsEnabled(res.smsEnabled || false);
        setTwilioSid(res.twilioSid || '');
        setTwilioToken(res.twilioToken || '');
        setTwilioFrom(res.twilioFrom || '');
        setTwilioTo(res.twilioTo || '');
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      <header className="bg-indigo-600 text-white p-4 flex items-center gap-3">
        <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* Mobile Push via ntfy */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-sm text-slate-800">Mobile Push (ntfy)</h2>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4 text-xs text-slate-700">
            <p className="font-semibold text-indigo-700 mb-1">Setup Guide (Free)</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Download <strong>ntfy</strong> app — <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" rel="noreferrer" className="text-indigo-600 underline">iOS</a> / <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Android</a></li>
              <li>Open app → tap "+" → enter a unique topic name → Subscribe</li>
              <li>Paste same topic below, Save, then Test</li>
            </ol>
          </div>
          <label className="block text-xs text-slate-600 font-medium mb-1">ntfy Topic Name</label>
          <input type="text" placeholder="e.g. stocksentry-yourname" value={ntfyTopic} onChange={e => setNtfyTopic(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex items-center gap-2 mb-4">
            <Toggle value={ntfyEnabled} onChange={() => setNtfyEnabled(!ntfyEnabled)} />
            <span className="text-sm text-slate-700">Enable push notifications</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (window.chrome && chrome.storage) chrome.storage.local.set({ ntfyTopic: ntfyTopic.trim(), ntfyEnabled }); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">Save</button>
            <button onClick={async () => {
              const topic = ntfyTopic.trim(); if (!topic) { setNtfyStatus('error'); return; }
              setNtfyStatus('sending');
              try { const r = await fetch(`https://ntfy.sh/${topic}`, { method: 'POST', headers: { 'Title': 'StockSentry Test', 'Priority': 'high', 'Tags': 'white_check_mark' }, body: 'StockSentry push test!' }); if (!r.ok) throw new Error(); setNtfyStatus('ok'); } catch { setNtfyStatus('error'); }
              setTimeout(() => setNtfyStatus(null), 3000);
            }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${ntfyStatus === 'ok' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ntfyStatus === 'error' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              {ntfyStatus === 'ok' ? <CheckCircle className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
              {ntfyStatus === 'sending' ? 'Sending...' : ntfyStatus === 'ok' ? 'Sent!' : ntfyStatus === 'error' ? 'Failed' : 'Test'}
            </button>
          </div>
        </div>

        {/* SMS via Twilio */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-sm text-slate-800">SMS Notifications (Twilio)</h2>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 text-xs text-slate-700">
            <p className="font-semibold text-green-700 mb-1">Setup Guide</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Sign up free at <a href="https://twilio.com" target="_blank" rel="noreferrer" className="text-green-700 underline font-medium">twilio.com</a> (free ~$15 trial credit)</li>
              <li>Get <strong>Account SID</strong> + <strong>Auth Token</strong> from dashboard</li>
              <li>Get a free <strong>Twilio phone number</strong></li>
              <li>Fill fields below → Save → Test SMS</li>
            </ol>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">Account SID</label>
              <input type="text" placeholder="ACxxxxxxxxxxxxxxxx" value={twilioSid} onChange={e => setTwilioSid(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">Auth Token</label>
              <input type="password" placeholder="Your auth token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-slate-600 font-medium mb-1">From (Twilio no.)</label>
                <input type="text" placeholder="+1234567890" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-600 font-medium mb-1">To (your number)</label>
                <input type="text" placeholder="+919876543210" value={twilioTo} onChange={e => setTwilioTo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Toggle value={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
            <span className="text-sm text-slate-700">Enable SMS notifications</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (window.chrome && chrome.storage) chrome.storage.local.set({ smsEnabled, twilioSid: twilioSid.trim(), twilioToken: twilioToken.trim(), twilioFrom: twilioFrom.trim(), twilioTo: twilioTo.trim() }); }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-lg font-medium transition-colors">Save</button>
            <button onClick={async () => {
              if (!twilioSid || !twilioToken || !twilioFrom || !twilioTo) { setSmsStatus('error'); return; }
              setSmsStatus('sending');
              try {
                const body = new URLSearchParams({ To: twilioTo.trim(), From: twilioFrom.trim(), Body: 'StockSentry SMS test! Your SMS alerts are working.' });
                const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid.trim()}/Messages.json`, {
                  method: 'POST',
                  headers: { 'Authorization': 'Basic ' + btoa(`${twilioSid.trim()}:${twilioToken.trim()}`), 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: body.toString()
                });
                if (!r.ok) { const err = await r.json(); console.error('Twilio error:', err); throw new Error(); }
                setSmsStatus('ok');
              } catch { setSmsStatus('error'); }
              setTimeout(() => setSmsStatus(null), 3000);
            }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${smsStatus === 'ok' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : smsStatus === 'error' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              {smsStatus === 'ok' ? <CheckCircle className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
              {smsStatus === 'sending' ? 'Sending...' : smsStatus === 'ok' ? 'Sent!' : smsStatus === 'error' ? 'Failed' : 'Test SMS'}
            </button>
          </div>
          {smsStatus === 'error' && <p className="text-rose-600 text-xs mt-2">Check all fields. Open extension service worker console for details.</p>}
        </div>

        {/* Browser Notification */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h2 className="font-semibold text-sm text-slate-800">Browser Notifications</h2>
          </div>
          <p className="text-xs text-slate-500">Always enabled — fires instantly when an item goes In Stock.</p>
        </div>

      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts]         = useState([]);
  const [newUrl, setNewUrl]             = useState('');
  const [customSelector, setCustomSelector] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(['watchlist'], (res) => {
        setProducts(res.watchlist || []);
      });
      const storageListener = (changes, namespace) => {
        if (namespace === 'local' && changes.watchlist) {
          setProducts(changes.watchlist.newValue || []);
        }
      };
      chrome.storage.onChanged.addListener(storageListener);
      return () => chrome.storage.onChanged.removeListener(storageListener);
    } else {
      const stored = localStorage.getItem('watchlist');
      if (stored) setProducts(JSON.parse(stored));
      else {
        setProducts([
          { id: 1, name: 'Sony PlayStation 5', site: 'amazon.in', status: 'out-of-stock', url: '#', lastChecked: '5 min ago', active: true },
          { id: 2, name: 'Amul Protein Shake', site: 'shop.amul.com', status: 'in-stock', url: '#', lastChecked: '2 min ago', active: true }
        ]);
      }
    }
  }, []);

  const saveProducts = (updated) => {
    setProducts(updated);
    if (window.chrome && chrome.storage) {
      chrome.storage.local.set({ watchlist: updated });
    } else {
      localStorage.setItem('watchlist', JSON.stringify(updated));
    }
  };

  const addProduct = (e) => {
    e.preventDefault();
    if (!newUrl) return;
    let hostname = 'Unknown';
    try { hostname = new URL(newUrl).hostname.replace('www.', ''); } catch(e) {}
    const newItem = {
      id: Date.now(),
      name: hostname ? `Item on ${hostname}` : 'New Tracked Item',
      site: hostname,
      status: 'pending',
      url: newUrl,
      customSelector: customSelector.trim() || null,
      lastChecked: 'Just now',
      active: true
    };
    saveProducts([...products, newItem]);
    setNewUrl('');
    setCustomSelector('');
    setShowAdvanced(false);
    if (window.chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'FORCE_CHECK' }).catch(e => console.log(e));
    }
  };

  const removeProduct  = (id) => saveProducts(products.filter(p => p.id !== id));
  const toggleActive   = (id) => saveProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));

  // Simulate restock: force status to out-of-stock, then trigger a real poll.
  // Background detects the OOS→InStock transition and fires notifs automatically.
  const simulateRestock = (id) => {
    const updated = products.map(p => p.id === id ? { ...p, status: 'out-of-stock' } : p);
    saveProducts(updated);
    // Give storage 300ms to commit, then force a real check
    setTimeout(() => {
      if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'FORCE_CHECK' }).catch(e => console.log(e));
      }
    }, 300);
  };

  const statusConfig = {
    'in-stock':     { label: 'In Stock',     cls: 'bg-emerald-100 text-emerald-700' },
    'out-of-stock': { label: 'Out of Stock', cls: 'bg-rose-100 text-rose-700' },
    'pending':      { label: 'Checking...', cls: 'bg-blue-100 text-blue-700 animate-pulse' },
    'unknown':      { label: 'Unknown',      cls: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* Settings Panel — overlays whole UI */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-indigo-200" />
          <h1 className="font-bold text-lg tracking-wide">StockSentry</h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-1 hover:bg-indigo-500 rounded transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* Add Product Form */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={addProduct} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste product URL..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                {showAdvanced ? 'Hide Advanced' : 'Advanced: Custom CSS Selector'}
              </button>

              {showAdvanced && (
                <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                  <label className="block text-slate-700 mb-1 font-medium">In-Stock CSS Selector (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. .add-to-cart, #buy-now-btn"
                    value={customSelector}
                    onChange={(e) => setCustomSelector(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-slate-500 mt-1" style={{ fontSize: '10px' }}>
                    If this element exists on the page, the product is considered In-Stock.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Watchlist */}
        <div className="flex flex-col gap-3">
          {products.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm">
              Your watchlist is empty.<br />Add a product URL above to get started.
            </div>
          ) : (
            products.map((product) => {
              const s = statusConfig[product.status] || statusConfig['unknown'];
              return (
                <div
                  key={product.id}
                  className={`group bg-white border rounded-xl p-3 shadow-sm transition-all flex flex-col gap-2 ${!product.active ? 'opacity-60 border-dashed' : 'border-slate-200 hover:border-indigo-300'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-sm text-slate-800 truncate" title={product.name}>
                        {product.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {product.site}
                        </span>
                        <span className="text-xs text-slate-400">Checked: {product.lastChecked}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <a href={product.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 transition-colors">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => simulateRestock(product.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                        title="Simulate restock (test notification)"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(product.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title={product.active ? 'Pause monitoring' : 'Resume monitoring'}
                      >
                        {product.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer className="bg-slate-50 p-2 text-center text-xs text-slate-400 border-t border-slate-200">
        StockSentry MVP
      </footer>
    </div>
  );
}
