
import React from 'react';
import { StudioToolType } from '../types';
import { TOOLS } from '../constants';

interface ToolContainerProps {
  toolId: StudioToolType;
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ toolId, children }) => {
  const tool = TOOLS.find(t => t.id === toolId)!;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50 dark:bg-black theme-transition">
      <header className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#080808] flex items-center justify-between theme-transition sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-emerald-500/20 shadow-md shrink-0 bg-neutral-950">
             <i className="fas fa-chess-knight text-emerald-400 text-lg"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center space-x-3 tracking-tighter">
              <span className="uppercase italic">{tool.name}</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-600 text-[11px] font-bold uppercase tracking-widest mt-1">{tool.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:border-emerald-500/40 transition shadow-sm">
            <i className="fas fa-bolt-lightning mr-2 text-emerald-500"></i> Active Logs
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ToolContainer;
