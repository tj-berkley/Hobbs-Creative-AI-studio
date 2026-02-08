
import React, { useState } from 'react';

const DeveloperPortal: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [subdomain, setSubdomain] = useState('creative');
  const dummyKey = "HOBBS_PLATFORM_KEY_82X_99Q_STUDIO";

  const handleCopy = () => {
    navigator.clipboard.writeText(dummyKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent theme-transition">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          <i className="fas fa-satellite-dish mr-1"></i> Infrastructure
        </div>
        <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Platform Bridge</h3>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-8 shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">API Key</h4>
            <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black rounded-lg uppercase">Live</span>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-black rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-inner group">
            <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm flex-1 truncate">{dummyKey}</code>
            <button onClick={handleCopy} className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition-all flex items-center justify-center shadow-sm">
              <i className={`fas ${isCopied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            </button>
          </div>

          <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800/50">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg mb-6">Integration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Subdomain</label>
                <div className="flex">
                  <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value)} className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-l-xl px-4 py-3 text-sm font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                  <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 border-l-0 rounded-r-xl px-4 py-3 text-neutral-500 font-bold text-sm">.yourdomain.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-8 flex flex-col shadow-sm dark:shadow-2xl">
          <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">BYOK Sync</h4>
          <div className="bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-6 space-y-4">
            <button onClick={() => (window as any).aistudio?.openSelectKey()} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/10">Sync AI Studio Key</button>
          </div>
          <div className="flex-1 space-y-4">
             <div className="flex items-center justify-between px-2"><span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Model Access</span><i className="fas fa-lock text-neutral-300 dark:text-neutral-700 text-[10px]"></i></div>
             {['Gemini 3 Pro', 'Veo 3.1 Cinematic'].map(p => (
               <div key={p} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800/50 rounded-xl"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">{p}</span></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPortal;
