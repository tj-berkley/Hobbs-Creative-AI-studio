
import React from 'react';
import { StudioToolType, ToolDefinition, PlatformConfig } from '../types';

interface SidebarProps {
  activeTool: StudioToolType;
  onToolSelect: (tool: StudioToolType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  credits?: { balance: number, tier: string };
  platformConfig: PlatformConfig;
  tools: ToolDefinition[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onToolSelect, 
  theme, 
  onToggleTheme, 
  user, 
  onLogout, 
  credits = { balance: 5000, tier: 'Studio Pro' },
  platformConfig,
  tools
}) => {
  return (
    <div className="w-64 bg-white dark:bg-[#080808] border-r border-neutral-200 dark:border-neutral-900 flex flex-col h-full theme-transition">
      <div className="p-6 flex flex-col h-full">
        {/* Whitelabeled Logo */}
        <div className="flex items-center space-x-3 mb-10">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border-2 shrink-0 relative overflow-hidden group bg-neutral-950"
            style={{ borderColor: `${platformConfig.brandColor}66` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${platformConfig.brandColor}1a` }}></div>
            <i 
              className={`fas ${platformConfig.logoIcon} text-xl relative z-10 transition-transform group-hover:rotate-12`}
              style={{ color: platformConfig.brandColor }}
            ></i>
          </div>
          <div className="truncate">
            <h1 className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white italic uppercase leading-none truncate">{platformConfig.name}</h1>
            <p 
              className="text-[9px] uppercase font-black tracking-[0.2em] mt-1"
              style={{ color: platformConfig.brandColor }}
            >
              Strategic Creative
            </p>
          </div>
        </div>

        {/* Studio Treasury */}
        <div className="mb-8 p-5 bg-neutral-950 dark:bg-black border border-neutral-900 rounded-[1.5rem] shadow-2xl text-white space-y-4 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" style={{ backgroundColor: `${platformConfig.brandColor}0d` }}></div>
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: platformConfig.brandColor }}>Treasury</span>
            <span 
              className="text-[8px] px-2.5 py-1 rounded-lg uppercase font-black border" 
              style={{ 
                color: platformConfig.brandColor, 
                backgroundColor: `${platformConfig.brandColor}33`,
                borderColor: `${platformConfig.brandColor}33`
              }}
            >{credits.tier === 'Beginner' ? 'Beginner' : credits.tier}</span>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black tracking-tighter italic uppercase text-neutral-100">{credits.balance.toLocaleString()}</div>
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Allocated Compute</p>
          </div>
          <button 
            onClick={() => onToolSelect(StudioToolType.BILLING)}
            className="w-full py-2.5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative z-10 shadow-lg active:scale-95"
            style={{ backgroundColor: platformConfig.brandColor }}
          >
            Refill Core
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group border ${
                activeTool === tool.id
                  ? 'shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 border-transparent'
              }`}
              style={activeTool === tool.id ? { 
                backgroundColor: `${platformConfig.brandColor}1a`, 
                color: platformConfig.brandColor,
                borderColor: `${platformConfig.brandColor}33`
              } : {}}
            >
              <i className={`fas ${tool.icon} w-5 text-center transition-colors ${
                activeTool === tool.id ? '' : 'group-hover:text-[var(--brand-primary)]'
              }`}
              style={activeTool === tool.id ? { color: platformConfig.brandColor } : {}}
              ></i>
              <span className="font-bold text-[11px] uppercase tracking-tight">{tool.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-900">
          <div className="bg-neutral-100 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between group">
            <div className="flex items-center space-x-3 truncate">
              <div 
                className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center text-[10px] font-black shrink-0 border"
                style={{ color: platformConfig.brandColor, borderColor: `${platformConfig.brandColor}33` }}
              >
                {user?.name.charAt(0).toUpperCase() || 'H'}
              </div>
              <div className="truncate">
                <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase truncate">{user?.name || 'Studio Member'}</p>
                <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">{credits.tier}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
              title="Sign Out"
            >
              <i className="fas fa-power-off text-xs"></i>
            </button>
          </div>

          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[var(--brand-primary)]/30 transition-all group shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <i className={`fas ${theme === 'light' ? 'fa-moon text-indigo-600' : 'fa-sun text-amber-500'} transition-transform group-hover:scale-110`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[var(--brand-primary)]' : 'bg-neutral-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-[1.125rem]' : 'left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
