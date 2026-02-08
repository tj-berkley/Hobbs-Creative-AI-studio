
import React, { useState } from 'react';

const DeveloperPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'monetization'>('infrastructure');
  const [isCopied, setIsCopied] = useState(false);
  const [subdomain, setSubdomain] = useState('creative');
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const dummyKey = "HOBBS_PLATFORM_KEY_82X_99Q_STUDIO";

  const handleCopy = () => {
    navigator.clipboard.writeText(dummyKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConnectStripe = () => {
    // In a real app, this would redirect to Stripe OAuth
    setIsStripeConnected(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent theme-transition">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <i className="fas fa-satellite-dish mr-1"></i> Developer Environment
            </div>
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Platform Control</h3>
          </div>
          
          <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <button 
              onClick={() => setActiveTab('infrastructure')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'infrastructure' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              Infrastructure
            </button>
            <button 
              onClick={() => setActiveTab('monetization')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monetization' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              Monetization
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'infrastructure' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Platform API Key</h4>
                <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black rounded-lg uppercase">Production Ready</span>
              </div>

              <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-black rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-inner group transition-all hover:border-indigo-500/30">
                <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm flex-1 truncate">{dummyKey}</code>
                <button onClick={handleCopy} className="w-12 h-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition-all flex items-center justify-center shadow-sm">
                  <i className={`fas ${isCopied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                </button>
              </div>
            </div>

            <div className="pt-10 border-t border-neutral-100 dark:border-neutral-800/50 space-y-6">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Subdomain Bridge</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Studio Identifier</label>
                  <div className="flex">
                    <input type="text" value={subdomain} onChange={e => setSubdomain(e.target.value)} className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-l-2xl px-5 py-4 text-sm font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                    <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 border-l-0 rounded-r-2xl px-5 py-4 text-neutral-500 font-bold text-sm">.hobbs.studio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 flex flex-col shadow-sm dark:shadow-2xl">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">AI Studio Sync</h4>
            <div className="bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-600/20 rounded-2xl p-8 space-y-6">
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">Ensure high-compute tasks are processed via your own billing account for maximum priority.</p>
              <button onClick={() => (window as any).aistudio?.openSelectKey()} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 transform active:scale-95">Sync Project Key</button>
            </div>
            <div className="flex-1 space-y-4">
               <div className="flex items-center justify-between px-2"><span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Model Permissions</span><i className="fas fa-lock-open text-green-500 text-[10px]"></i></div>
               {['Gemini 3 Pro Cinematic', 'Veo 3.1 Pro Motion', 'Imagen 4 Ultra'].map(p => (
                 <div key={p} className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800/50 rounded-2xl group hover:border-indigo-500/20 transition-all"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full group-hover:animate-pulse"></div><span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">{p}</span></div>
               ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
            <header className="space-y-2">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Stripe Connect Bridge</h4>
              <p className="text-[11px] text-neutral-500 font-medium">Link your Stripe account to handle user subscriptions and credit sales directly.</p>
            </header>
            
            <div className={`p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center space-y-6 transition-all ${isStripeConnected ? 'border-green-500/30 bg-green-500/5' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/20'}`}>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-lg ${isStripeConnected ? 'bg-green-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300'}`}>
                <i className={isStripeConnected ? 'fas fa-check-double' : 'fab fa-stripe-s'}></i>
              </div>
              {isStripeConnected ? (
                <div className="space-y-2">
                  <h5 className="font-black text-neutral-900 dark:text-white uppercase tracking-widest text-xs">Account Linked</h5>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Payouts: Daily • status: active</p>
                  <button onClick={() => setIsStripeConnected(false)} className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Disconnect Account</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h5 className="font-black text-neutral-900 dark:text-white uppercase tracking-widest text-xs">Ready to Connect</h5>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Enable automatic billing & recurring revenue</p>
                  </div>
                  <button 
                    onClick={handleConnectStripe}
                    className="px-10 py-4 bg-[#635bff] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#5851e0] transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Connect with Stripe
                  </button>
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-neutral-100 dark:border-neutral-800/50 space-y-6">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Monetization Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Pro Tier Subscription', val: '$15.00' },
                  { label: 'Annual Pro Discount', val: '2 Months Free' },
                  { label: '1k Credit Pack', val: '$4.99' },
                  { label: '5k Credit Pack', val: '$19.99' }
                ].map(item => (
                  <div key={item.label} className="p-4 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[11px] font-bold text-neutral-900 dark:text-white">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-8 shadow-sm dark:shadow-2xl">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Financial Dashboard</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">MTD Revenue</p>
                  <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter italic uppercase">$12,840</p>
                </div>
                <div className="p-6 bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-1">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Active Subs</p>
                  <p className="text-xl font-black text-neutral-900 dark:text-white tracking-tighter italic uppercase">842</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-6 shadow-sm dark:shadow-2xl">
              <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg">Admin Webhooks</h4>
              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">Configure endpoints to receive payment success and credit top-up events.</p>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between group">
                  <span className="text-[10px] font-mono text-neutral-400">/api/stripe/webhook</span>
                  <i className="fas fa-external-link text-[10px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"></i>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">+ Add New Endpoint</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperPortal;
