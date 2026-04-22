import { useState, useEffect } from 'react';
import { Settings, Plus, Play, Pause, Trash2, ExternalLink, Activity, X, Smartphone, Bell, CheckCircle, Zap } from 'lucide-react';

// ─── Toggle Switch helper ───────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${value ? 'bg-cyan-500' : 'bg-slate-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
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
    <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col font-sans text-slate-200">
      <header className="border-b border-slate-800 p-4 flex items-center justify-between bg-slate-950">
        <h1 className="font-bold text-sm text-cyan-400">System Preferences</h1>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        {/* Mobile Push via ntfy */}
        <div className="flex flex-col gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h2 className="font-semibold text-sm text-slate-100">ntfy.sh Push</h2>
          </div>
          <input type="text" placeholder="Topic: e.g. mystocks-123" value={ntfyTopic} onChange={e => setNtfyTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-100 placeholder-slate-500" />
          <div className="flex items-center gap-3 mt-1">
            <Toggle value={ntfyEnabled} onChange={() => setNtfyEnabled(!ntfyEnabled)} />
            <span className="text-sm font-medium text-slate-300">Enable Mobile Push</span>
          </div>
        </div>

        {/* SMS via Twilio */}
        <div className="flex flex-col gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-sm text-slate-100">Twilio SMS</h2>
          </div>
          <input type="text" placeholder="Account SID" value={twilioSid} onChange={e => setTwilioSid(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-100 placeholder-slate-500" />
          <input type="password" placeholder="Auth Token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-100 placeholder-slate-500" />
          <div className="flex gap-2">
            <input type="text" placeholder="From (+123)" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-100 placeholder-slate-500" />
            <input type="text" placeholder="To (+919)" value={twilioTo} onChange={e => setTwilioTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-100 placeholder-slate-500" />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <Toggle value={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
            <span className="text-sm font-medium text-slate-300">Enable SMS Alerts</span>
          </div>
        </div>

      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <span className="text-sm font-medium text-cyan-400">{status}</span>
        <button onClick={saveSettings} className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] text-sm px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95">
          Save Settings
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

  // High contrast vibrant UI configs
  const statusConfig = {
    'in-stock':     { label: 'Available',     cls: 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]' },
    'out-of-stock': { label: 'Out of Stock',  cls: 'text-rose-400 bg-rose-950/40 border border-rose-500/30' },
    'pending':      { label: 'Scanning...',   cls: 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 animate-pulse' },
    'unknown':      { label: 'Verify Link',   cls: 'text-amber-400 bg-amber-950/40 border border-amber-500/30' },
  };

  return (
    <div className="flex flex-col h-full relative font-sans text-slate-200 bg-slate-900 selection:bg-cyan-500/30">
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="font-bold text-base tracking-wide text-white">StockSentry</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

        {/* Input */}
        <form onSubmit={addProduct} className="flex flex-col gap-2">
          <div className="flex gap-2 relative">
            <input
              type="url"
              placeholder="Paste product link to track..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-100 placeholder-slate-500 shadow-inner"
              required
            />
            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95 group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 text-white" />
            </button>
          </div>
        </form>

        {/* Watchlist */}
        <div className="flex flex-col gap-3">
          {products.length === 0 ? (
            <div className="text-center text-slate-500 py-16 flex flex-col items-center gap-3 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
              <Activity className="w-8 h-8 opacity-40 text-cyan-500" />
              <p className="text-sm font-medium">Radar is empty.<br/><span className="text-slate-600 font-normal">Add a link to begin scanning.</span></p>
            </div>
          ) : (
            products.map((product) => {
              const s = statusConfig[product.status] || statusConfig['unknown'];
              return (
                <div key={product.id} className={`group relative bg-slate-800/80 border rounded-xl p-4 transition-all flex flex-col gap-3 shadow-lg ${!product.active ? 'opacity-40 border-dashed border-slate-700 backdrop-blur-none' : 'border-slate-700 hover:border-cyan-500/50 backdrop-blur-sm'}`}>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <a href={product.url} target="_blank" rel="noreferrer" className="font-bold text-sm text-slate-100 truncate hover:text-cyan-400 flex items-center gap-1.5 transition-colors">
                        {product.name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded-full">{product.site}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-[11px] font-medium text-slate-500">Last scanned: {product.lastChecked}</span>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      
                      <button onClick={() => simulateRestock(product.id)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg flex items-center justify-center transition-colors border border-transparent hover:border-amber-500/30" title="Simulate Restock Trigger">
                        <Zap className="w-4 h-4" />
                      </button>
                      
                      <button onClick={() => toggleActive(product.id)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg flex items-center justify-center transition-colors border border-transparent hover:border-cyan-500/30" title={product.active ? 'Pause Radar' : 'Resume Radar'}>
                        {product.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button onClick={() => removeProduct(product.id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg flex items-center justify-center transition-colors border border-transparent hover:border-rose-500/30" title="Delete Entry">
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
    </div>
  );
}
