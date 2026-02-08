
import React, { useState } from 'react';

const DeveloperPortal: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [subdomain, setSubdomain] = useState('creative');
  const [domain, setDomain] = useState('yourplatform.com');
  const dummyKey = "HOBBS_PLATFORM_KEY_82X_99Q_STUDIO";

  const handleCopy = () => {
    navigator.clipboard.writeText(dummyKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          <i className="fas fa-satellite-dish mr-1"></i> Compute Infrastructure
        </div>
        <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Studio Platform Bridge</h3>
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-2xl text-sm font-medium">
          Integrate Hobbs Creative Studio directly into your ecosystem. Scale advanced generative models across your own domains with our unified platform SDK.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API Authentication Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-8 shadow-sm dark:shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Platform API Key</h4>
              <p className="text-xs text-neutral-500">Primary credential for multi-tenant model access.</p>
            </div>
            <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-500 text-[10px] font-black rounded-lg border border-green-500/20 uppercase">Network Live</span>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-black rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-inner group">
            <i className="fas fa-shield-alt text-neutral-400 dark:text-neutral-700 group-hover:text-indigo-600 transition-colors"></i>
            <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm flex-1 truncate select-all">{dummyKey}</code>
            <button 
              onClick={handleCopy} 
              className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition-all flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm"
            >
              <i className={`fas ${isCopied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            </button>
          </div>

          <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800/50">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg mb-6">Subdomain Integration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Subdomain Host</label>
                <div className="flex">
                  <input 
                    type="text" 
                    value={subdomain} 
                    onChange={e => setSubdomain(e.target.value)}
                    className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-l-xl px-4 py-3 text-sm font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  />
                  <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 border-l-0 rounded-r-xl px-4 py-3 text-neutral-500 font-bold text-sm">
                    .yourdomain.com
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">CName Target</label>
                <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-indigo-600 dark:text-indigo-400 font-mono text-xs flex items-center shadow-inner">
                  lb.hobbs-creative-studio.com
                </div>
              </div>
            </div>
            <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              Verify Configuration
            </button>
          </div>
        </div>

        {/* Managed Keys Card */}
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-8 flex flex-col shadow-sm dark:shadow-2xl">
          <div className="space-y-1">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">User Credentials</h4>
            <p className="text-xs text-neutral-500">BYOK (Bring Your Own Key) Management</p>
          </div>
          
          <div className="bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-6 space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic">
              "Enable direct billing for high-compute models (Veo, Gemini 3 Pro) by allowing users to securely manage their individual AI Studio keys."
            </p>
            <button 
              onClick={() => (window as any).aistudio?.openSelectKey()}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/10"
            >
              Sync AI Studio Key
            </button>
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex items-center justify-between px-2">
               <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Model Permissions</span>
               <i className="fas fa-lock text-neutral-300 dark:text-neutral-700 text-[10px]"></i>
             </div>
             <div className="space-y-2">
               {['Gemini 3 Pro (Vision)', 'Veo 3.1 Cinematic', 'Voice Clone Pipeline'].map(p => (
                 <div key={p} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800/50 rounded-xl">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]"></div>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">{p}</span>
                 </div>
               ))}
             </div>
          </div>

          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block text-center text-[10px] text-neutral-400 dark:text-neutral-600 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-tighter">
            Cloud Billing Docs <i className="fas fa-external-link-alt ml-1"></i>
          </a>
        </div>
      </div>

      {/* SDK Documentation Preview */}
      <section className="space-y-8 pt-8 border-t border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic uppercase">SDK Quickstart</h4>
          <button className="text-indigo-600 dark:text-indigo-500 text-xs font-black uppercase hover:underline">View Full Reference</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Mount SDK', desc: 'npm install @hobbs/creative-platform-sdk', icon: 'fa-terminal' },
            { step: '02', title: 'Auth Context', desc: 'Wrap your app in the <StudioProvider /> component.', icon: 'fa-layer-group' },
            { step: '03', title: 'Embed Tool', desc: 'Use <HobbsVoice /> or <HobbsImage /> hooks to call engines.', icon: 'fa-rocket' }
          ].map(s => (
            <div key={s.step} className="group p-8 rounded-[2.5rem] bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/50 hover:border-indigo-500/30 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300 shadow-sm">
                <i className={`fas ${s.icon} text-indigo-600 dark:text-indigo-500 group-hover:text-white`}></i>
              </div>
              <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 mb-2">{s.step}</div>
              <h5 className="font-black text-neutral-900 dark:text-white text-sm uppercase mb-2 tracking-tight">{s.title}</h5>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DeveloperPortal;
