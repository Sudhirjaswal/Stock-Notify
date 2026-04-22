import { useState, useEffect } from 'react';
import { Settings, Plus, Play, Pause, Trash2, ExternalLink, Activity, X, Smartphone, Bell, CheckCircle, Zap } from 'lucide-react';

// ─── Toggle Switch helper ───────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
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
    <div className="flex flex-col h-full bg-white z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <header className="border-b border-gray-200 p-4 flex items-center justify-between bg-white text-gray-900 shrink-0">
        <h1 className="font-semibold text-lg">Settings</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50">
        
        {/* Mobile Push via ntfy */}
        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-sm text-gray-900">Push Notifications (ntfy.sh)</h2>
          </div>
          <label className="text-xs font-medium text-gray-700">Topic Name</label>
          <input type="text" placeholder="e.g. mystocks-123" value={ntfyTopic} onChange={e => setNtfyTopic(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900" />
          <div className="flex items-center gap-2 mt-1">
            <Toggle value={ntfyEnabled} onChange={() => setNtfyEnabled(!ntfyEnabled)} />
            <span className="text-xs font-medium text-gray-700">Enable Mobile Push</span>
          </div>
        </div>

        {/* SMS via Twilio */}
        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0 mb-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-sm text-gray-900">SMS Alerts (Twilio)</h2>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-xs font-medium text-gray-700">Account SID</label>
            <input type="text" placeholder="Enter SID" value={twilioSid} onChange={e => setTwilioSid(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900" />
            
            <label className="text-xs font-medium text-gray-700">Auth Token</label>
            <input type="password" placeholder="Enter Token" value={twilioToken} onChange={e => setTwilioToken(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900" />
            
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">From Number</label>
                <input type="text" placeholder="+123" value={twilioFrom} onChange={e => setTwilioFrom(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">To Number</label>
                <input type="text" placeholder="+919" value={twilioTo} onChange={e => setTwilioTo(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 border-t border-gray-100 pt-3">
            <Toggle value={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
            <span className="text-xs font-medium text-gray-700">Enable SMS Alerts</span>
          </div>
        </div>

      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
        <span className="text-xs font-medium text-green-600">{status}</span>
        <button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-md font-semibold transition-all">
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

  const statusConfig = {
    'in-stock':     { label: 'In Stock',     cls: 'text-green-800 bg-green-100' },
    'out-of-stock': { label: 'Out of Stock', cls: 'text-red-800 bg-red-100' },
    'pending':      { label: 'Checking...',  cls: 'text-blue-800 bg-blue-100 animate-pulse' },
    'unknown':      { label: 'Error',        cls: 'text-yellow-800 bg-yellow-100' },
  };

  return (
    <div className="w-[400px] h-[550px] flex flex-col relative font-sans bg-gray-50 text-gray-900 border border-gray-200 overflow-hidden shadow-2xl">
      {showSettings ? (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      ) : (
        <>
          {/* Header */}
      <header className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 border border-gray-200 bg-gray-50 rounded shadow-sm">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="font-bold text-xl text-gray-900 tracking-tight">StockSentry</h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200" title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">

        {/* Input Form */}
        <form onSubmit={addProduct} className="flex flex-col gap-2">
          <div className="flex gap-2 relative">
            <input
              type="url"
              placeholder="Paste product link here..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 shadow-sm"
              required
            />
            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>

        {/* Watchlist */}
        <div className="flex flex-col gap-3">
          {products.length === 0 ? (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Activity className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-medium">No items tracked yet.<br/><span className="text-gray-400 font-normal">Add a URL above to start checking stock.</span></p>
            </div>
          ) : (
            products.map((product) => {
              const s = statusConfig[product.status] || statusConfig['unknown'];
              return (
                <div key={product.id} className={`group bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow ${!product.active ? 'opacity-60 bg-gray-50' : ''}`}>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <a href={product.url} target="_blank" rel="noreferrer" className="font-semibold text-base text-gray-900 truncate hover:text-blue-600 flex items-center gap-1.5 transition-colors">
                        {product.name}
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{product.site}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide shrink-0 ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500">Checked: {product.lastChecked}</span>
                    <div className="flex items-center gap-1.5">
                      
                      <button onClick={() => simulateRestock(product.id)} className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors" title="Simulate Restock Notification">
                        <Zap className="w-4 h-4" />
                      </button>
                      
                      <button onClick={() => toggleActive(product.id)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title={product.active ? 'Pause Tracking' : 'Resume Tracking'}>
                        {product.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button onClick={() => removeProduct(product.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Entry border border-transparent">
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
        </>
      )}
    </div>
  );
}
