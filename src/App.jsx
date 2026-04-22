import { useState, useEffect } from 'react';
import { Settings, Plus, Play, Pause, Trash2, ExternalLink, Activity, X, Smartphone, Bell, CheckCircle, Zap } from 'lucide-react';

// ─── Toggle Switch helper ───────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${value ? 'bg-neutral-900' : 'bg-neutral-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-4' : ''}`} />
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────
function SettingsPanel({ onClose }) {
  const [ntfyTopic, setNtfyTopic] = useState('');
  const [ntfyEnabled, setNtfyEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled]       = useState(false);
  const [twilioSid, setTwilioSid]         = useState('');
  const [twilioToken, setTwilioToken]     = useState('');
  const [twilioFrom, setTwilioFrom]       = useState('');
  const [twilioTo, setTwilioTo]           = useState('');
  const [status, setStatus] = useState(null);

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

  const saveSettings = () => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.set({ ntfyTopic: ntfyTopic.trim(), ntfyEnabled, smsEnabled, twilioSid: twilioSid.trim(), twilioToken: twilioToken.trim(), twilioFrom: twilioFrom.trim(), twilioTo: twilioTo.trim() });
    }
    setStatus('Saved');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col font-sans">
      <header className="border-b border-neutral-100 p-4 flex items-center justify-between">
        <h1 className="font-medium text-sm text-neutral-900">Preferences</h1>
        <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-500">
          <X className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {/* Mobile Push via ntfy */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-neutral-400" />
            <h2 className="font-medium text-sm text-neutral-900">ntfy.sh Push</h2>
          </div>
          <input type="text" placeholder="Topic: e.g. mystocks-123" value={ntfyTopic} onChange={e => setNtfyTopic(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50" />
          <div className="flex items-center gap-2">
            <Toggle value={ntfyEnabled} onChange={() => setNtfyEnabled(!ntfyEnabled)} />
            <span className="text-sm text-neutral-600">Enable Mobile Push</span>
          </div>
        </div>

        {/* SMS via Twilio */}
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neutral-400" />
            <h2 className="font-medium text-sm text-neutral-900">Twilio SMS</h2>
          </div>
          <input type="text" placeholder="Account SID" value={twilioSid} onChange={e => setTwilioSid(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50" />
          <input type="password" placeholder="Auth Token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)}
            className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50" />
          <div className="flex gap-2">
            <input type="text" placeholder="From (+123)" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)}
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50" />
            <input type="text" placeholder="To (+919)" value={twilioTo} onChange={e => setTwilioTo(e.target.value)}
              className="w-full border border-neutral-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-neutral-50/50" />
          </div>
          <div className="flex items-center gap-2">
            <Toggle value={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
            <span className="text-sm text-neutral-600">Enable SMS Alerts</span>
          </div>
        </div>

      </div>
      
      <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs text-neutral-500">{status}</span>
        <button onClick={saveSettings} className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm px-5 py-2 rounded-md font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts]         = useState([]);
  const [newUrl, setNewUrl]             = useState('');
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
          { id: 2, name: 'Apple iPhone 15 Pro', site: 'apple.com', status: 'in-stock', url: '#', lastChecked: '2 min ago', active: true }
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
      customSelector: null,
      lastChecked: 'Just now',
      active: true
    };
    saveProducts([...products, newItem]);
    setNewUrl('');
    if (window.chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'FORCE_CHECK' }).catch(e => console.log(e));
    }
  };

  const removeProduct  = (id) => saveProducts(products.filter(p => p.id !== id));
  const toggleActive   = (id) => saveProducts(products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const simulateRestock = (id) => {
    const updated = products.map(p => p.id === id ? { ...p, status: 'out-of-stock' } : p);
    saveProducts(updated);
    setTimeout(() => {
      if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'FORCE_CHECK' }).catch(e => console.log(e));
      }
    }, 300);
  };

  const statusConfig = {
    'in-stock':     { label: 'Available',     cls: 'text-neutral-900 bg-neutral-100' },
    'out-of-stock': { label: 'Unavailable',   cls: 'text-neutral-400 bg-neutral-50' },
    'pending':      { label: 'Checking',      cls: 'text-neutral-500 bg-neutral-100 animate-pulse' },
    'unknown':      { label: 'Error',         cls: 'text-rose-500 bg-rose-50' },
  };

  return (
    <div className="flex flex-col h-full relative font-sans text-neutral-900 bg-white">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <header className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-neutral-900" />
          <h1 className="font-semibold text-sm tracking-tight text-neutral-900">StockSentry</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

        {/* Input */}
        <form onSubmit={addProduct} className="flex flex-col gap-2">
          <div className="flex gap-2 relative">
            <input
              type="url"
              placeholder="Paste product link"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 bg-neutral-50/50 border border-neutral-200 rounded-md pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder-neutral-400"
              required
            />
            <button type="submit" className="absolute right-1.5 top-1.5 p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </form>

        {/* Watchlist */}
        <div className="flex flex-col gap-3">
          {products.length === 0 ? (
            <div className="text-center text-neutral-400 py-12 flex flex-col items-center gap-2">
              <Activity className="w-6 h-6 opacity-20" />
              <p className="text-xs font-medium">No tracking entries.</p>
            </div>
          ) : (
            products.map((product) => {
              const s = statusConfig[product.status] || statusConfig['unknown'];
              return (
                <div key={product.id} className={`group relative bg-white border rounded-lg p-3 transition-all flex flex-col gap-2.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${!product.active ? 'opacity-50 border-dashed border-neutral-200' : 'border-neutral-200 hover:border-neutral-300'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <a href={product.url} target="_blank" rel="noreferrer" className="font-medium text-sm text-neutral-900 truncate hover:underline underline-offset-2 flex items-center gap-1.5">
                        {product.name}
                        <ExternalLink className="w-3 h-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">{product.site}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-50/50 mt-0.5">
                    <span className="text-[10px] text-neutral-400">Checked {product.lastChecked}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => simulateRestock(product.id)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded flex items-center justify-center transition-colors" title="Simulate Restock Notification">
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleActive(product.id)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded flex items-center justify-center transition-colors" title={product.active ? 'Pause' : 'Resume'}>
                        {product.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => removeProduct(product.id)} className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
