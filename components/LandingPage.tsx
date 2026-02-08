
import React, { useState } from 'react';
import { TOOLS, HOBBS_AVATAR } from '../constants';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, theme, onToggleTheme }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white selection:bg-indigo-500/30 overflow-x-hidden theme-transition">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 flex items-center justify-center">
              <img src={HOBBS_AVATAR} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">Hobbs Studio</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Capabilities</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition">Pricing</a>
            <a href="#dev" className="hover:text-indigo-600 dark:hover:text-white transition">API Bridge</a>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigateAuth('login')}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigateAuth('register')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all transform active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <i className="fas fa-sparkles mr-2"></i> Visionary Creative Intelligence
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-neutral-900 dark:text-white">
            Meet Hobbs. <br /> <span className="text-indigo-600">Your New Lead Mind.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
            The all-in-one studio for high-fidelity content creation. Guided by the authoritative intelligence of the Hobbs AI core.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
            <button 
              onClick={() => onNavigateAuth('register')}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 transform active:scale-95"
            >
              Start Creating Now
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm">
              Explore Suite
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.4em]">Studio Capabilities</h2>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Unified Content Engine</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.slice(0, 6).map(tool => (
              <div key={tool.id} className="group p-8 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] hover:border-indigo-500/30 transition-all hover:bg-white dark:hover:bg-neutral-900/60 shadow-sm hover:shadow-xl">
                <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <i className={`fas ${tool.icon} text-indigo-600 dark:text-indigo-500 text-lg`}></i>
                </div>
                <h4 className="text-xl font-black uppercase italic mb-3 tracking-tighter text-neutral-900 dark:text-white">{tool.name}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed font-medium">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-8 relative bg-neutral-50 dark:bg-black/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.4em]">Investment Infrastructure</h2>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Choose Your Plan</h3>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 relative p-1 transition-colors"
              >
                <div className={`w-4 h-4 bg-indigo-600 rounded-full transition-all ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${billingCycle === 'annual' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>Annual</span>
                <span className="bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">2 Months Free</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="p-10 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] space-y-8 flex flex-col shadow-sm">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Explorer</h4>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$0<span className="text-xs text-neutral-400 dark:text-neutral-500 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {['100 Generation Credits', 'Gemini Flash Access', 'Standard Resolution', 'Standard Support'].map(item => (
                  <li key={item} className="flex items-center text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">
                    <i className="fas fa-check-circle text-neutral-200 dark:text-neutral-800 mr-3"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                Start for Free
              </button>
            </div>

            {/* Studio Pro Tier (Featured) */}
            <div className="p-10 bg-indigo-600 border border-indigo-400 rounded-[3rem] space-y-8 flex flex-col transform md:scale-105 shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-white/20 text-[8px] font-black px-3 py-1 rounded-full uppercase text-white backdrop-blur-md">Best Value</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Studio Pro</h4>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-white">
                  {billingCycle === 'monthly' ? '$15' : '$150'}
                  <span className="text-xs text-indigo-100 not-italic ml-2 font-bold tracking-normal">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </div>
              <ul className="space-y-4 flex-1">
                {['5,000 Generation Credits', 'Gemini 3 Pro Access', 'Veo Cinema Engine', 'Custom Voice Training', 'Priority Inference Nodes'].map(item => (
                  <li key={item} className="flex items-center text-[11px] text-white/90 font-bold">
                    <i className="fas fa-check-circle text-white/40 mr-3"></i> {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <button onClick={() => onNavigateAuth('register')} className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition shadow-xl">
                  {billingCycle === 'monthly' ? 'Subscribe Monthly' : 'Subscribe Annually'}
                </button>
                <p className="text-[9px] text-indigo-200 text-center font-bold uppercase tracking-widest">+ Additional credits available any time</p>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="p-10 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] space-y-8 flex flex-col shadow-sm">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Platform Build</h4>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$49<span className="text-xs text-neutral-400 dark:text-neutral-500 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {['Unlimited Credits', 'Stripe Bridge Access', 'Custom Subdomains', 'Dedicated Compute Instance', 'Direct API Access'].map(item => (
                  <li key={item} className="flex items-center text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">
                    <i className="fas fa-check-circle text-neutral-200 dark:text-neutral-800 mr-3"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                Build Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200 dark:border-white/5 bg-white dark:bg-black px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
          <div className="flex items-center space-x-3 opacity-50">
             <div className="w-6 h-6 rounded-full overflow-hidden grayscale opacity-50">
               <img src={HOBBS_AVATAR} alt="Hobbs" className="w-full h-full object-cover" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">Hobbs Creative Studio &copy; 2025</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Privacy Architecture</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Service Terms</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Documentation</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Community Hub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
