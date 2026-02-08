
import React from 'react';
import { TOOLS } from '../constants';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, theme, onToggleTheme }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white selection:bg-indigo-500/30 overflow-x-hidden theme-transition">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-crown text-white text-sm"></i>
            </div>
            <span className="text-lg font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">Hobbs Studio</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-white transition">Pricing</a>
            <a href="#dev" className="hover:text-indigo-600 dark:hover:text-white transition">API</a>
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
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-8 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-fade-in">
            <i className="fas fa-sparkles mr-2"></i> Private Creative Intelligence
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-neutral-900 dark:text-white">
            The Workspace for <br /> <span className="text-indigo-600">Elite Creators.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-medium leading-relaxed">
            A unified studio powered by Gemini 3.0 & Veo. Image, video, voice, and deep analysis in one secure, affordable platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
            <button 
              onClick={() => onNavigateAuth('register')}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 transform active:scale-95"
            >
              Start Creating Now
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm">
              Watch Showcase
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.4em]">Integrated Intelligence</h2>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">The Full Studio Suite</h3>
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
      <section id="pricing" className="py-24 px-8 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-[0.4em]">Pricing Infrastructure</h2>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Professional & Affordable</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="p-10 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] space-y-8 flex flex-col shadow-sm">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Nano Tier</h4>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$0<span className="text-xs text-neutral-400 dark:text-neutral-500 not-italic ml-2 font-bold tracking-normal">/ forever</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {['Basic Gemini Chat', 'Standard Image Gen', 'Content Analysis', 'Public Workspace'].map(item => (
                  <li key={item} className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 font-bold">
                    <i className="fas fa-check-circle text-neutral-200 dark:text-neutral-800 mr-3"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-700 transition">
                Start for Free
              </button>
            </div>

            {/* Studio Tier (Featured) */}
            <div className="p-10 bg-indigo-600 border border-indigo-400 rounded-[3rem] space-y-8 flex flex-col transform md:scale-105 shadow-2xl shadow-indigo-600/30">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Studio Pro</h4>
                  <span className="bg-white/20 text-[8px] font-black px-2 py-0.5 rounded-full uppercase text-white">Most Popular</span>
                </div>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-white">$15<span className="text-xs text-indigo-100 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {['Gemini 3 Pro Access', 'Veo Video Generation', 'Live Voice Interaction', 'Private Studio Projects', 'Magic Edit Tools'].map(item => (
                  <li key={item} className="flex items-center text-xs text-white/90 font-bold">
                    <i className="fas fa-check-circle text-white/40 mr-3"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition shadow-xl">
                Unlock Pro Studio
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="p-10 bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] space-y-8 flex flex-col shadow-sm">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Platform Core</h4>
                <div className="text-4xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">$49<span className="text-xs text-neutral-400 dark:text-neutral-500 not-italic ml-2 font-bold tracking-normal">/ month</span></div>
              </div>
              <ul className="space-y-4 flex-1">
                {['Full Platform SDK', 'Subdomain Integration', 'API Key Management', 'Multi-tenant Support', 'Priority Compute'].map(item => (
                  <li key={item} className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 font-bold">
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3 opacity-50">
             <i className="fas fa-crown text-indigo-600 dark:text-indigo-500"></i>
             <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">Hobbs Creative Studio &copy; 2025</span>
          </div>
          <div className="flex space-x-8 text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
