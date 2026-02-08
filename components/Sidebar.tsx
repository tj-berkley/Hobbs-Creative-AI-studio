
import React from 'react';
import { StudioToolType } from '../types';
import { TOOLS, HOBBS_AVATAR } from '../constants';

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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100">
            <img src={HOBBS_AVATAR} alt="Hobbs" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Hobbs</h1>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black tracking-widest">Creative Suite</p>
          </div>
        </div>

        {/* Credit Meter */}
        <div className="mb-8 p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white space-y-3 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Studio Credits</span>
            <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-black">{credits.tier}</span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black tracking-tighter italic uppercase">{credits.balance.toLocaleString()}</div>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Balance Remaining</p>
          </div>
          <button 
            onClick={() => onToolSelect(StudioToolType.BILLING)}
            className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition relative z-10"
          >
            Top Up Balance
          </button>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeTool === tool.id
                  ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <i className={`fas ${tool.icon} w-5 text-center ${
                activeTool === tool.id ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
              }`}></i>
              <span className="font-bold text-xs uppercase tracking-tight">{tool.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-between group">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <i className={`fas ${theme === 'light' ? 'fa-moon text-indigo-600' : 'fa-sun text-yellow-500'} transition-transform group-hover:scale-110`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                Mode
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
