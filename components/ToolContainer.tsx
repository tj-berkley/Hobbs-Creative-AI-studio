
import React from 'react';
import { StudioToolType } from '../types';
import { TOOLS, HOBBS_AVATAR } from '../constants';

interface ToolContainerProps {
  toolId: StudioToolType;
  children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ toolId, children }) => {
  const tool = TOOLS.find(t => t.id === toolId)!;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50 dark:bg-black theme-transition">
      <header className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] flex items-center justify-between theme-transition sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0">
             <img src={HOBBS_AVATAR} alt="Hobbs" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center space-x-3 tracking-tighter">
              <span className="uppercase italic">{tool.name}</span>
            </h2>
            <p className="text-neutral-500 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-1">{tool.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition shadow-sm">
            <i className="fas fa-history mr-2"></i> Session Logs
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
          background: #222;
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
