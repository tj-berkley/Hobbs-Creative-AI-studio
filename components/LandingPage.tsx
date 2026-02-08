
import React, { useState } from 'react';
import { TOOLS } from '../constants';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, theme, onToggleTheme }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#020202] text-neutral-900 dark:text-white selection:bg-emerald-500/30 overflow-x-hidden theme-transition">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl border-2 border-emerald-400/30 bg-neutral-950 flex items-center justify-center shrink-0 shadow-lg">
               <i className="fas fa-chess-knight text-emerald-400 text-lg"></i>
            </div>
            <span className="text-xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">Sam Klub</span>
          </div>
          <div className="hidden md:flex items-center space-x-10 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-emerald-500 transition-colors">Infrastructure</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">Tiers</a>
            <a href="#dev" className="hover:text-emerald-500 transition-colors">Connect</a>
          </div>
          <div className="flex items-center space-x-8">
            <button 
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 transition shadow-sm border border-neutral-200 dark:border-neutral-800"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onNavigateAuth('login')}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-emerald-500 transition"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigateAuth('register')}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all transform active:scale-95 shadow-xl shadow-emerald-900/20"
              >
                Join the Klub
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-56 pb-40 px-10 relative overflow-hidden">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-600/5 dark:bg-emerald-500/10 blur-[150px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 text-center lg:text-left space-y-10">
            <div className="inline-flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <i className="fas fa-shield-halved mr-1"></i> Strategic Intelligence Matrix Active
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-neutral-900 dark:text-white">
              Creative <br /> <span className="text-emerald-500">Mastery.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl lg:mx-0 mx-auto font-medium leading-relaxed">
              Step into Sam Klub. The high-performance studio environment for visionaries who demand precision, speed, and elite-tier AI coordination.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-5 sm:space-y-0 sm:space-x-8 pt-8">
              <button 
                onClick={() => onNavigateAuth('register')}
                className="w-full sm:w-auto px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-emerald-900/30 transform active:scale-95"
              >
                Enter Studio Core
              </button>
              <button className="w-full sm:w-auto px-12 py-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:border-emerald-500 transition-all shadow-sm">
                Explore Tech Rack
              </button>
            </div>
          </div>

          <div className="flex-1 relative group lg:block hidden">
            <div className="absolute -inset-6 bg-emerald-500/10 rounded-[4rem] blur-3xl group-hover:bg-emerald-500/20 transition duration-1000"></div>
            <div className="relative w-[450px] h-[550px] bg-neutral-950 rounded-[4rem] border-2 border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-900/20 transition-transform duration-1000 group-hover:scale-[1.02]">
               <i className="fas fa-chess-knight text-emerald-500 text-[240px] opacity-80 animate-float group-hover:scale-110 transition-transform duration-1000"></i>
               <div className="absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent space-y-4 rounded-b-[4rem]">
                  <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">Sam Core Active</h4>
                  <div className="flex items-center space-x-4">
                     <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Secure Protocol: Synchronized</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-10 bg-white dark:bg-[#060606]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-5">
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">Klub Infrastructure</h2>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Neural Coordination Rack</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TOOLS.slice(0, 6).map(tool => (
              <div key={tool.id} className="group p-10 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] hover:border-emerald-500/40 transition-all hover:bg-white dark:hover:bg-neutral-900/50 shadow-sm hover:shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-950 border-2 border-emerald-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-700 shadow-md">
                  <i className={`fas ${tool.icon} text-emerald-600 dark:text-emerald-500 text-xl`}></i>
                </div>
                <h4 className="text-2xl font-black uppercase italic mb-4 tracking-tighter text-neutral-900 dark:text-white">{tool.name}</h4>
                <p className="text-base text-neutral-500 dark:text-neutral-500 leading-relaxed font-medium">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 relative bg-neutral-50 dark:bg-[#040404]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">The Sam Access</h2>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Studio Membership Tiers</h3>
            
            <div className="flex items-center justify-center space-x-6 mt-10">
              <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-14 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 relative p-1 transition-colors"
              >
                <div className={`w-5 h-5 bg-emerald-500 rounded-full shadow-lg transition-all ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
              <div className="flex items-center space-x-3">
                <span className={`text-[11px] font-black uppercase tracking-widest ${billingCycle === 'annual' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>Annual</span>
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-emerald-500/20">Elite Discount</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Nano Tier */}
            <div className="p-12 bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3.5rem] space-y-10 flex flex-col shadow-sm">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Visitor</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$0<span className="text-sm text-neutral-400 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-5 flex-1">
                {['100 Compute Credits', 'Gemini Flash 2.5 Access', 'Standard Render Pool', 'Klub Public Docs'].map(item => (
                  <li key={item} className="flex items-center text-[12px] text-neutral-600 dark:text-neutral-500 font-bold">
                    <i className="fas fa-circle-check text-neutral-200 dark:text-neutral-800 mr-4 text-sm"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-emerald-500 transition shadow-inner">
                Initialize Access
              </button>
            </div>

            {/* Klub Pro Tier */}
            <div className="p-12 bg-neutral-950 border-2 border-emerald-500 rounded-[3.5rem] space-y-10 flex flex-col transform md:scale-105 shadow-[0_0_80px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-emerald-500 text-[9px] font-black px-4 py-1.5 rounded-full uppercase text-black shadow-lg">Strategic Tier</span>
              </div>
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Klub Pro</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-white">
                  {billingCycle === 'monthly' ? '$15' : '$150'}
                  <span className="text-sm text-neutral-400 not-italic ml-2 font-bold tracking-normal">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </div>
              <ul className="space-y-5 flex-1">
                {['5,000 High-Compute Credits', 'Gemini 3 Pro Strategic Access', 'Veo Motion Engine', 'Diarization & Multi-Speaker Lab', 'Priority Support Queue'].map(item => (
                  <li key={item} className="flex items-center text-[12px] text-white/90 font-bold">
                    <i className="fas fa-circle-check text-emerald-500/40 mr-4 text-sm"></i> {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-4">
                <button onClick={() => onNavigateAuth('register')} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition shadow-xl shadow-emerald-900/30 transform active:scale-95">
                  {billingCycle === 'monthly' ? 'Subscribe Monthly' : 'Subscribe Annually'}
                </button>
                <p className="text-[9px] text-neutral-500 text-center font-black uppercase tracking-widest italic">Neural Sync Priority Enabled</p>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="p-12 bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3.5rem] space-y-10 flex flex-col shadow-sm">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Mogul Core</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$49<span className="text-sm text-neutral-400 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-5 flex-1">
                {['Unlimited Compute Bandwidth', 'Dedicated Subdomain Bridge', 'Strategic Stripe Integration', 'Direct Sam AI API Bridge', 'Concierge Success Knight'].map(item => (
                  <li key={item} className="flex items-center text-[12px] text-neutral-600 dark:text-neutral-500 font-bold">
                    <i className="fas fa-circle-check text-neutral-200 dark:text-neutral-800 mr-4 text-sm"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-emerald-500 transition shadow-inner">
                Establish Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-neutral-200 dark:border-white/5 bg-white dark:bg-black px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
          <div className="flex items-center space-x-4 opacity-70">
             <div className="w-10 h-10 rounded-xl border border-emerald-500/30 shrink-0 bg-neutral-950 flex items-center justify-center">
                <i className="fas fa-chess-knight text-emerald-400 text-sm"></i>
             </div>
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-900 dark:text-white">Sam Klub Studio &copy; 2025</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-10 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            <a href="#" className="hover:text-emerald-500 transition-colors">Protocol</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Infrastructure Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Manuals</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Executive Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
