
import React, { useState, useEffect } from 'react';
import { ProjectState, StudioToolType, SocialPostPrefill } from '../../types';

interface MemoryNodeProps {
  onSetActiveTool: (tool: StudioToolType) => void;
  onShareToSocialHub: (data: SocialPostPrefill) => void;
}

const MemoryNode: React.FC<MemoryNodeProps> = ({ onSetActiveTool, onShareToSocialHub }) => {
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [isAutomating, setIsAutomating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hobbs-project-memory');
    if (saved) {
      setProjectState(JSON.parse(saved));
    }
  }, []);

  const handleResume = () => {
    if (projectState) {
      onSetActiveTool(projectState.lastTool);
    }
  };

  const handleAutoSocial = () => {
    if (!projectState || projectState.movieTimeline.length === 0) return;
    setIsAutomating(true);
    
    // Simulate neural cross-platform scheduling
    setTimeout(() => {
      const lastClip = projectState.movieTimeline[projectState.movieTimeline.length - 1];
      onShareToSocialHub({
        mediaUrl: lastClip.thumbnail,
        title: `Auto-Campaign: ${lastClip.name}`,
        type: 'video'
      });
      setIsAutomating(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 space-y-12 animate-fade-in bg-neutral-50 dark:bg-[#030303]">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <i className="fas fa-brain-circuit mr-1"></i> Neural Recall Active
        </div>
        <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Strategic Memory</h3>
        <p className="text-neutral-500 font-medium italic">Synchronizing last session nodes and automated distribution pipelines.</p>
      </header>

      {projectState ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] p-10 space-y-8 shadow-sm group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Active Session Found</h4>
                <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">
                  {projectState.lastTool.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Last Modified: {new Date(projectState.lastUpdate).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <i className="fas fa-history"></i>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-neutral-50 dark:bg-black/40 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="w-16 h-16 bg-neutral-950 rounded-lg overflow-hidden border border-emerald-500/10">
                  {projectState.movieTimeline[0]?.thumbnail && (
                    <img src={projectState.movieTimeline[0].thumbnail} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase text-neutral-800 dark:text-neutral-200">{projectState.movieTimeline.length} SCENE NODES REGISTERED</p>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter">Project integrity verified • 100% Core Load</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleResume}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/30 hover:bg-emerald-500 transition-all transform active:scale-95 flex items-center justify-center space-x-3"
            >
              <i className="fas fa-play"></i>
              <span>Resume Project</span>
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] p-10 space-y-8 shadow-sm">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1">Automated Tasks</h4>
              <p className="text-[13px] text-neutral-500 leading-relaxed font-medium italic">Trigger Hobbs AI to perform high-priority post-production tasks based on your memory node.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <button 
                onClick={handleAutoSocial}
                disabled={isAutomating}
                className="p-6 bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-left flex items-center justify-between group hover:border-indigo-500/50 transition-all"
               >
                  <div className="flex items-center space-x-5">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <i className={`fas ${isAutomating ? 'fa-circle-notch fa-spin' : 'fa-bullhorn'}`}></i>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-tight">Draft Social Campaign</p>
                      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-tighter">Automate X, IG, and LinkedIn posts</p>
                    </div>
                  </div>
                  <i className="fas fa-arrow-right text-neutral-300 dark:text-neutral-700 group-hover:translate-x-1 transition-transform"></i>
               </button>

               <button className="p-6 bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-left flex items-center justify-between group hover:border-indigo-500/50 transition-all opacity-50 cursor-not-allowed">
                  <div className="flex items-center space-x-5">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-tight">Schedule Daily Recap</p>
                      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-tighter">Email project status to team</p>
                    </div>
                  </div>
                  <i className="fas fa-lock text-neutral-300 dark:text-neutral-700"></i>
               </button>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/50 flex items-center space-x-3">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Automation Engine: Ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
          <i className="fas fa-brain-circuit text-8xl"></i>
          <p className="text-[12px] font-black uppercase tracking-[0.4em]">No Strategic Memories Found</p>
        </div>
      )}
    </div>
  );
};

export default MemoryNode;
