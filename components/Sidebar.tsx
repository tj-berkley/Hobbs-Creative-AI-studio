
import React from 'react';
import { StudioToolType } from '../types';
import { TOOLS } from '../constants';

interface SidebarProps {
  activeTool: StudioToolType;
  onToolSelect: (tool: StudioToolType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  credits?: { balance: number, tier: string };
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, theme, onToggleTheme, user, onLogout, credits = { balance: 5000, tier: 'Studio Pro' } }) => {
  return (
    <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full theme-transition">
      <div className="p-6 flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border-2 border-amber-400/40 bg-neutral-950 shrink-0">
            <span className="text-amber-400 font-black italic text-xl select-none">H</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white italic uppercase">Hobbs</h1>
            <p className="text-[9px] text-neutral-500 dark:text-neutral-500 uppercase font-black tracking-[0.2em]">Lead Intelligence</p>
          </div>
        </div>

        {/* Credit Meter */}
        <div className="mb-8 p-4 bg-neutral-950 dark:bg-neutral-800 border border-neutral-800 dark:border-neutral-700 rounded-2xl shadow-xl text-white space-y-3 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Studio Bank</span>
            <span className="text-[8px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-black border border-amber-400/30">{credits.tier}</span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black tracking-tighter italic uppercase text-neutral-100">{credits.balance.toLocaleString()}</div>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Available Power</p>
          </div>
          <button 
            onClick={() => onToolSelect(StudioToolType.BILLING)}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition relative z-10"
          >
            Refill Core
          </button>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTool === tool.id
                  ? 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <i className={`fas ${tool.icon} w-5 text-center ${
                activeTool === tool.id ? 'text-amber-600 dark:text-amber-400' : 'group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
              }`}></i>
              <span className="font-bold text-[11px] uppercase tracking-tight">{tool.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-between group">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center text-[10px] font-black text-amber-400 shrink-0 border border-amber-400/30">
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase truncate">{user?.name || 'Explorer'}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">{credits.tier}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-xs"></i>
            </button>
          </div>

          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <i className={`fas ${theme === 'light' ? 'fa-moon text-indigo-600' : 'fa-sun text-amber-500'} transition-transform group-hover:scale-110`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                Mode
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-amber-400' : 'bg-neutral-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
