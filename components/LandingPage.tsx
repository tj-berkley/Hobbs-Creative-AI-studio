
import React, { useState } from 'react';
import { TOOLS } from '../constants';
import { StudioToolType } from '../types';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'register') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, theme, onToggleTheme }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Select the 6 core pillars of the Studio
  const featuredTools = TOOLS.filter(t => 
    [
      StudioToolType.STORY_ENGINE, 
      StudioToolType.MOVIE_STUDIO, 
      StudioToolType.VIDEO_GEN, 
      StudioToolType.IMAGE_GEN, 
      StudioToolType.SOCIAL_HUB, 
      StudioToolType.LIVE_VOICE
    ].includes(t.id)
  );

  const getCustomDescription = (id: StudioToolType, fallback: string) => {
    switch (id) {
      case StudioToolType.STORY_ENGINE:
        return "Architect multi-genre literary masterworks for global sale or decompose them into high-fidelity movie scripts. Integrated with the Movie Studio for automated scene conversion.";
      case StudioToolType.MOVIE_STUDIO:
        return "The production terminal where scripts become reality. Ingest narrative blueprints from the Ghostwriter to generate, master, and monetize full-length cinematic assets.";
      case StudioToolType.IMAGE_GEN:
        return "Pro-grade 4K image generation with elite-tier precision. Integrated with Magic Edit for natural language manipulation, cinematic lighting, and volumetric fog injection.";
      case StudioToolType.VIDEO_GEN:
        return "Dynamic motion synthesis including Image-to-Video and Temporal Extension. Powering the Movie Studio with precise character lipsync and persona-driven animation.";
      case StudioToolType.SOCIAL_HUB:
        return "The Box Office and distribution node. Launch your mastered productions to a global audience with integrated ticket sales and audience sentiment analytics.";
      case StudioToolType.LIVE_VOICE:
        return "Voice Lab: Low-latency voice synthesis, zero-shot cloning, and precision emotion mapping for cinematic character performance and real-time interaction.";
      default:
        return fallback;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#020202] text-neutral-900 dark:text-white selection:bg-emerald-500/30 overflow-x-hidden theme-transition">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-neutral-200 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl border-2 border-emerald-400/30 bg-neutral-950 flex items-center justify-center shrink-0 shadow-lg">
               <i className="fas fa-chess-knight text-emerald-400 text-lg"></i>
            </div>
            <span className="text-xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">Hobbs Studio</span>
          </div>
          <div className="hidden md:flex items-center space-x-10 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-emerald-500 transition-colors">Infrastructure</a>
            <a href="#pipeline" className="hover:text-emerald-500 transition-colors">Pipeline</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">Tiers</a>
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
                Join the Studio
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
              Hobbs <br /> <span className="text-emerald-500">Studio.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-2xl lg:mx-0 mx-auto font-medium leading-relaxed">
              Step into Hobbs Studio. The high-performance creative infrastructure where narrative ghostwriting and cinematic production collide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-5 sm:space-y-0 sm:space-x-8 pt-8">
              <button 
                onClick={() => onNavigateAuth('register')}
                className="w-full sm:w-auto px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-emerald-900/30 transform active:scale-95"
              >
                Enter Studio Core
              </button>
              <a href="#pipeline" className="w-full sm:w-auto px-12 py-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:border-emerald-500 transition-all shadow-sm text-center">
                Watch the Pipeline
              </a>
            </div>
          </div>

          <div className="flex-1 relative group lg:block hidden">
            <div className="absolute -inset-6 bg-emerald-500/10 rounded-[4rem] blur-3xl group-hover:bg-emerald-500/20 transition duration-1000"></div>
            <div className="relative w-[450px] h-[550px] bg-neutral-950 rounded-[4rem] border-2 border-emerald-500/40 flex items-center justify-center shadow-2xl shadow-emerald-900/20 transition-transform duration-1000 group-hover:scale-[1.02]">
               <i className="fas fa-chess-knight text-emerald-500 text-[240px] opacity-80 animate-float group-hover:scale-110 transition-transform duration-1000"></i>
               <div className="absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent space-y-4 rounded-b-[4rem]">
                  <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">Hobbs Core Active</h4>
                  <div className="flex items-center space-x-4">
                     <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Integrated Narrative Pipeline: Sync</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Pipeline Highlight */}
      <section id="pipeline" className="py-32 px-10 bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <h2 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em]">The Master Pipeline</h2>
              <h3 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white leading-none">
                From <span className="text-emerald-500">Ghostwriter</span> to <span className="text-indigo-500">Full Feature.</span>
              </h3>
              <p className="text-lg text-neutral-500 font-medium leading-relaxed italic">
                Hobbs Studio eliminates the friction between inspiration and execution. Generate a non-fiction masterwork or a thriller novel in the <span className="text-neutral-900 dark:text-white font-bold">Ghostwriter</span>, then watch as it is automatically converted into a structured script for the <span className="text-neutral-900 dark:text-white font-bold">Movie Studio</span> to build your film, scene by scene.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {[
                  { icon: 'fa-pen-nib', title: '01. Ghostwrite', desc: 'Narrative to Script.' },
                  { icon: 'fa-file-invoice', title: '02. Production', desc: 'Auto-Scene Render.' },
                  { icon: 'fa-film', title: '03. Release', desc: 'Ticketed Premiere.' }
                ].map((step, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4">
                    <i className={`fas ${step.icon} text-emerald-500 text-xl`}></i>
                    <h4 className="text-xs font-black uppercase text-neutral-900 dark:text-white">{step.title}</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="aspect-video bg-neutral-900 rounded-[3rem] border border-emerald-500/20 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-indigo-600/20 opacity-40"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-black/60 backdrop-blur-xl rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/30 shadow-2xl group-hover:scale-110 transition-transform">
                       <i className="fas fa-play ml-1 text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Neural Pipeline Preview</p>
                      <p className="text-sm font-bold text-white italic">"Witness text manifesting into cinema"</p>
                    </div>
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
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">Studio Infrastructure</h2>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Neural Production Rack</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTools.map(tool => (
              <div key={tool.id} className="group p-10 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] hover:border-emerald-500/40 transition-all hover:bg-white dark:hover:bg-neutral-900/50 shadow-sm hover:shadow-2xl flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-950 border-2 border-emerald-500/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-700 shadow-md">
                  <i className={`fas ${tool.icon} text-emerald-600 dark:text-emerald-500 text-xl`}></i>
                </div>
                <h4 className="text-2xl font-black uppercase italic mb-4 tracking-tighter text-neutral-900 dark:text-white">
                  {tool.id === StudioToolType.IMAGE_GEN ? 'Hobbs Vision' : tool.id === StudioToolType.VIDEO_GEN ? 'Hobbs Cinema' : tool.id === StudioToolType.STORY_ENGINE ? 'AI Ghostwriter' : tool.name}
                </h4>
                <p className="text-base text-neutral-500 dark:text-neutral-500 leading-relaxed font-medium flex-1">
                  {getCustomDescription(tool.id, tool.description)}
                </p>
                {tool.id === StudioToolType.MOVIE_STUDIO && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center space-x-3 mb-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Direct Ghostwriter Sync Active</span>
                    </div>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase leading-tight">Master large files by breaking scripts into manageable scene clusters automatically.</p>
                  </div>
                )}
                {tool.id === StudioToolType.VIDEO_GEN && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
                    <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 italic">Persona Lipsync Engine</span>
                    <span className="text-[7px] font-black bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 italic">Image-to-Video Node</span>
                  </div>
                )}
                {tool.id === StudioToolType.IMAGE_GEN && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
                    <span className="text-[7px] font-black bg-pink-500/10 text-pink-500 px-2.5 py-1 rounded-full uppercase tracking-widest border border-pink-500/20 italic">4K Precision Output</span>
                    <span className="text-[7px] font-black bg-purple-500/10 text-purple-500 px-2.5 py-1 rounded-full uppercase tracking-widest border border-purple-500/20 italic">Volumetric Fog Logic</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-10 relative bg-neutral-50 dark:bg-[#040404]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em]">The Hobbs Access</h2>
            <h3 className="text-5xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Membership Tiers</h3>
            
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
                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-3 py-1 rounded-full uppercase border border-emerald-500/20">2 Months Free</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Nano Tier */}
            <div className="p-12 bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3.5rem] space-y-10 flex flex-col shadow-sm">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Visitor</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">
                  {billingCycle === 'monthly' ? '$10' : '$100'}
                  <span className="text-sm text-neutral-400 not-italic ml-2 font-bold tracking-normal">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </div>
              <ul className="space-y-5 flex-1">
                {['1,000 Compute Credits', 'Gemini Flash 2.5 Access', 'Standard Render Pool', 'Studio Public Docs'].map(item => (
                  <li key={item} className="flex items-center text-[12px] text-neutral-600 dark:text-neutral-500 font-bold">
                    <i className="fas fa-circle-check text-neutral-200 dark:text-neutral-800 mr-4 text-sm"></i> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => onNavigateAuth('register')} className="w-full py-5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-emerald-500 transition shadow-inner">
                Initialize Access
              </button>
            </div>

            {/* Studio Pro Tier */}
            <div className="p-12 bg-neutral-950 border-2 border-emerald-500 rounded-[3.5rem] space-y-10 flex flex-col transform md:scale-105 shadow-[0_0_80px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-emerald-500 text-[9px] font-black px-4 py-1.5 rounded-full uppercase text-black shadow-lg">Strategic Tier</span>
              </div>
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Studio Pro</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-white">
                  {billingCycle === 'monthly' ? '$29' : '$290'}
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
                <p className="text-[9px] text-neutral-500 text-center font-black uppercase tracking-widest italic">80% Yield Margin Calibrated</p>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="p-12 bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[3.5rem] space-y-10 flex flex-col shadow-sm">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400">Mogul Core</h4>
                <div className="text-5xl font-black tracking-tighter italic uppercase text-neutral-900 dark:text-white">
                  {billingCycle === 'monthly' ? '$79' : '$790'}
                  <span className="text-sm text-neutral-400 not-italic ml-2 font-bold tracking-normal">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
              </div>
              <ul className="space-y-5 flex-1">
                {['Unlimited Compute Bandwidth', 'Dedicated Subdomain Mapping', 'Platform Stripe Connector', 'Direct Hobbs AI API Bridge', 'Concierge Success Partner'].map(item => (
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
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-900 dark:text-white">Hobbs Studio &copy; 2025</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-10 text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            <a href="#" className="hover:text-emerald-500 transition-colors">Protocol</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Studio Terms</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Manuals</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Platform Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
