
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ToolContainer from './components/ToolContainer.tsx';
import ChatTool from './components/tools/ChatTool.tsx';
import ImageStudio from './components/tools/ImageStudio.tsx';
import ImageEditTool from './components/tools/ImageEditTool.tsx';
import VideoStudio from './components/tools/VideoStudio.tsx';
import VideoEditTool from './components/tools/VideoEditTool.tsx';
import VoiceStudio from './components/tools/VoiceStudio.tsx';
import ContentAnalysisTool from './components/tools/ContentAnalysisTool.tsx';
import DeveloperPortal from './components/tools/DeveloperPortal.tsx';
import TranscriptionTool from './components/tools/TranscriptionTool.tsx';
import SocialHub from './components/tools/SocialHub.tsx';
import MovieStudio from './components/tools/MovieStudio.tsx';
import MemoryNode from './components/tools/MemoryNode.tsx';
import KnowledgeBank from './components/tools/KnowledgeBank.tsx';
import StoryEngine from './components/tools/StoryEngine.tsx';
import LandingPage from './components/LandingPage.tsx';
import AuthPortal from './components/AuthPortal.tsx';
import { StudioToolType, UserCredits, SocialPostPrefill, MovieClip, PlatformConfig, ScriptProject } from './types.ts';
import { TOOLS } from './constants.tsx';

const DEFAULT_CONFIG: PlatformConfig = {
  name: 'Hobbs Studio',
  brandColor: '#10b981', // emerald-500
  logoIcon: 'fa-chess-knight',
  enabledTools: TOOLS.map(t => t.id),
  subdomain: 'studio',
  isDeployed: false
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'studio'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTool, setActiveTool] = useState<StudioToolType>(StudioToolType.CHAT);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [credits, setCredits] = useState<UserCredits>({ balance: 5000, tier: 'Studio Pro' });
  const [prefillSocialPost, setPrefillSocialPost] = useState<SocialPostPrefill | null>(null);
  const [pendingScriptProject, setPendingScriptProject] = useState<ScriptProject | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('hobbs-theme') as 'light' | 'dark') || 'dark';
  });

  // Whitelabeling State
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => {
    const saved = localStorage.getItem('hobbs-platform-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Project Memory Tracking
  const [movieTimeline, setMovieTimeline] = useState<MovieClip[]>([]);

  useEffect(() => {
    localStorage.setItem('hobbs-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist platform config
  useEffect(() => {
    localStorage.setItem('hobbs-platform-config', JSON.stringify(platformConfig));
    // Apply CSS variable for brand color
    document.documentElement.style.setProperty('--brand-primary', platformConfig.brandColor);
  }, [platformConfig]);

  // Save project memory whenever key state changes
  useEffect(() => {
    if (view === 'studio' && activeTool !== StudioToolType.MEMORY_NODE) {
      const memory = {
        lastTool: activeTool,
        movieTimeline: movieTimeline,
        lastUpdate: Date.now()
      };
      localStorage.setItem('hobbs-project-memory', JSON.stringify(memory));
    }
  }, [activeTool, movieTimeline, view]);

  // Load project memory on startup
  useEffect(() => {
    const saved = localStorage.getItem('hobbs-project-memory');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.movieTimeline) setMovieTimeline(parsed.movieTimeline);
    }
  }, []);

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

  const handleShareToSocialHub = (data: SocialPostPrefill) => {
    setPrefillSocialPost(data);
    setActiveTool(StudioToolType.SOCIAL_HUB);
  };

  const handleExportToMovieStudio = (project: ScriptProject) => {
    setPendingScriptProject(project);
    setActiveTool(StudioToolType.MOVIE_STUDIO);
  };

  const filteredTools = useMemo(() => {
    return TOOLS.filter(t => platformConfig.enabledTools.includes(t.id));
  }, [platformConfig.enabledTools]);

  // Ensure active tool is still enabled
  useEffect(() => {
    if (view === 'studio' && !platformConfig.enabledTools.includes(activeTool)) {
      if (platformConfig.enabledTools.length > 0) {
        setActiveTool(platformConfig.enabledTools[0]);
      }
    }
  }, [platformConfig.enabledTools, activeTool, view]);

  const renderTool = () => {
    switch (activeTool) {
      case StudioToolType.CHAT:
        return <ChatTool />;
      case StudioToolType.STORY_ENGINE:
        return <StoryEngine onExportToMovieStudio={handleExportToMovieStudio} />;
      case StudioToolType.MEMORY_NODE:
        return <MemoryNode onSetActiveTool={setActiveTool} onShareToSocialHub={handleShareToSocialHub} />;
      case StudioToolType.KNOWLEDGE_BANK:
        return <KnowledgeBank />;
      case StudioToolType.IMAGE_GEN:
        return <ImageStudio />;
      case StudioToolType.IMAGE_EDIT:
        return <ImageEditTool />;
      case StudioToolType.VIDEO_GEN:
        return <VideoStudio />;
      case StudioToolType.VIDEO_EDIT:
        return <VideoEditTool />;
      case StudioToolType.MOVIE_STUDIO:
        return (
          <MovieStudio 
            userCredits={credits} 
            onShareToSocialHub={handleShareToSocialHub}
            pendingScriptProject={pendingScriptProject}
            onClearPendingProject={() => setPendingScriptProject(null)}
          />
        );
      case StudioToolType.LIVE_VOICE:
        return <VoiceStudio />;
      case StudioToolType.CONTENT_ANALYSIS:
        return <ContentAnalysisTool />;
      case StudioToolType.TRANSCRIPTION:
        return <TranscriptionTool />;
      case StudioToolType.DEVELOPER:
        return <DeveloperPortal config={platformConfig} onConfigChange={setPlatformConfig} />;
      case StudioToolType.SOCIAL_HUB:
        return (
          <SocialHub 
            userCredits={credits} 
            prefillData={prefillSocialPost} 
            onClearPrefill={() => setPrefillSocialPost(null)}
          />
        );
      case StudioToolType.BILLING:
        return (
          <div className="max-w-4xl mx-auto p-12 space-y-12 animate-fade-in">
             <header className="space-y-4">
                <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Studio Treasury</h3>
                <p className="text-neutral-500 font-medium italic">Platform integrity ensured via a zero-loss cost pass-through protocol. Yield target: 80%.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-6 shadow-sm">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Yield Configuration</h4>
                   <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-black text-indigo-600 italic uppercase">{credits.tier}</p>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase">Revenue Split: {credits.tier === 'Enterprise' ? '80/20' : '60/40'}</p>
                      </div>
                      <div className="p-4 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-2xl">
                        <p className="text-[9px] font-black text-[var(--brand-primary)] uppercase tracking-widest mb-1">Compute Efficiency</p>
                        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">80% platform profit margin achieved via direct compute pass-through.</p>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition">Adjust Tier Access</button>
                </div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-10 space-y-6 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-20"><i className="fas fa-chart-pie text-6xl"></i></div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-white">Compute Credits</h4>
                   <div className="space-y-1">
                      <p className="text-4xl font-black tracking-tighter italic uppercase">{credits.balance.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Allocated Nodes</p>
                   </div>
                   <div className="space-y-3 pt-4">
                      <button className="w-full py-4 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-100 transition shadow-lg">Buy Credits ($5/1k)</button>
                      <p className="text-[8px] text-center opacity-40 font-black uppercase tracking-widest italic">All costs passed to user to maintain platform yield</p>
                   </div>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 p-8 text-center">
            <i className="fas fa-tools text-6xl mb-4 opacity-10"></i>
            <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Feature Coming Soon</h3>
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
        platformConfig={platformConfig}
        tools={filteredTools}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ToolContainer toolId={activeTool} platformConfig={platformConfig}>
          {renderTool()}
        </ToolContainer>
      </div>
      <style>{`
        :root {
          --brand-primary: ${platformConfig.brandColor};
        }
        .text-brand { color: var(--brand-primary); }
        .bg-brand { background-color: var(--brand-primary); }
        .border-brand { border-color: var(--brand-primary); }
        .theme-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default App;
