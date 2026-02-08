
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ToolContainer from './components/ToolContainer';
import ChatTool from './components/tools/ChatTool';
import ImageStudio from './components/tools/ImageStudio';
import ImageEditTool from './components/tools/ImageEditTool';
import VideoStudio from './components/tools/VideoStudio';
import VideoEditTool from './components/tools/VideoEditTool';
import VoiceStudio from './components/tools/VoiceStudio';
import ContentAnalysisTool from './components/tools/ContentAnalysisTool';
import DeveloperPortal from './components/tools/DeveloperPortal';
import TranscriptionTool from './components/tools/TranscriptionTool';
import LandingPage from './components/LandingPage';
import AuthPortal from './components/AuthPortal';
import { StudioToolType, UserCredits } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'studio'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTool, setActiveTool] = useState<StudioToolType>(StudioToolType.CHAT);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [credits, setCredits] = useState<UserCredits>({ balance: 5000, tier: 'Studio Pro' });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hobbs-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hobbs-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setView('studio');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const navigateToAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setView('auth');
  };

  const renderTool = () => {
    switch (activeTool) {
      case StudioToolType.CHAT:
        return <ChatTool />;
      case StudioToolType.IMAGE_GEN:
        return <ImageStudio />;
      case StudioToolType.IMAGE_EDIT:
        return <ImageEditTool />;
      case StudioToolType.VIDEO_GEN:
        return <VideoStudio />;
      case StudioToolType.VIDEO_EDIT:
        return <VideoEditTool />;
      case StudioToolType.LIVE_VOICE:
        return <VoiceStudio />;
      case StudioToolType.CONTENT_ANALYSIS:
        return <ContentAnalysisTool />;
      case StudioToolType.TRANSCRIPTION:
        return <TranscriptionTool />;
      case StudioToolType.DEVELOPER:
        return <DeveloperPortal />;
      case StudioToolType.BILLING:
        return (
          <div className="max-w-4xl mx-auto p-12 space-y-12 animate-fade-in">
             <header className="space-y-4">
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Account Billing</h3>
                <p className="text-neutral-500 font-medium">Manage your subscription and top up generation credits.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-6 shadow-sm">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Current Subscription</h4>
                   <div className="space-y-2">
                      <p className="text-2xl font-black text-indigo-600 italic uppercase">{credits.tier}</p>
                      <p className="text-[11px] font-bold text-neutral-500 uppercase">Renewal Date: March 24, 2025</p>
                   </div>
                   <button className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition">Manage Plan</button>
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-10 space-y-6 shadow-xl shadow-indigo-600/20 text-white">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Credit Balance</h4>
                   <div className="space-y-1">
                      <p className="text-4xl font-black tracking-tighter italic uppercase">{credits.balance.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Remaining Generations</p>
                   </div>
                   <button className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-100 transition shadow-lg">Buy Credits</button>
                </div>
             </div>

             <section className="space-y-8">
                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-xl">Credit Top-Up Packs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   {[
                      { amount: '1,000', price: '$4.99', desc: 'Creative Spark' },
                      { amount: '5,000', price: '$19.99', desc: 'Studio Surge' },
                      { amount: '15,000', price: '$49.99', desc: 'Enterprise Wave' }
                   ].map(pack => (
                      <button key={pack.amount} className="p-8 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] text-left space-y-4 hover:border-indigo-500 transition-all group">
                         <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-indigo-600 transition">{pack.desc}</span>
                            <i className="fas fa-plus-circle text-neutral-100 dark:text-neutral-800 group-hover:text-indigo-500 transition"></i>
                         </div>
                         <div className="space-y-1">
                            <p className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter italic uppercase">{pack.amount}</p>
                            <p className="text-[10px] font-black text-indigo-600">{pack.price}</p>
                         </div>
                      </button>
                   ))}
                </div>
             </section>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 p-8 text-center">
            <i className="fas fa-tools text-6xl mb-4 opacity-10"></i>
            <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Feature Coming Soon</h3>
            <p className="max-w-md">We are currently integrating the latest Gemini models for this tool.</p>
          </div>
        );
    }
  };

  if (view === 'landing') {
    return <LandingPage onNavigateAuth={navigateToAuth} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (view === 'auth') {
    return <AuthPortal mode={authMode} onBack={() => setView('landing')} onAuthSuccess={handleLogin} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden theme-transition ${theme === 'dark' ? 'dark bg-[#0a0a0a] text-neutral-200' : 'bg-neutral-50 text-neutral-800'}`}>
      <Sidebar 
        activeTool={activeTool} 
        onToolSelect={setActiveTool} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
        credits={credits}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ToolContainer toolId={activeTool}>
          {renderTool()}
        </ToolContainer>
      </div>
    </div>
  );
};

export default App;
