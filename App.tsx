
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
import { StudioToolType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'studio'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTool, setActiveTool] = useState<StudioToolType>(StudioToolType.CHAT);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
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
