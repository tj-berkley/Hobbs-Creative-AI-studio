
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
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect, theme, onToggleTheme, user, onLogout }) => {
  return (
    <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full theme-transition">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fas fa-crown text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Hobbs</h1>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-black tracking-widest">Studio Dashboard</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
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
          {/* User Profile Card */}
          <div className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700/50 flex items-center justify-between group">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase truncate">{user?.name || 'Explorer'}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Nano Tier</p>
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
                {theme === 'light' ? 'Night Mode' : 'Light Mode'}
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
