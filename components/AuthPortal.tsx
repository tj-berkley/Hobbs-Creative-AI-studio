
import React, { useState } from 'react';

interface AuthPortalProps {
  mode: 'login' | 'register';
  onBack: () => void;
  onAuthSuccess: (user: { name: string; email: string }) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ mode, onBack, onAuthSuccess, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate Auth
    setTimeout(() => {
      if (email && password) {
        onAuthSuccess({ 
          name: name || email.split('@')[0], 
          email 
        });
      } else {
        setError('Please authenticate with valid Hobbs credentials.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#020202] flex items-center justify-center p-8 relative overflow-hidden theme-transition">
      {/* Background Matrix */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 dark:bg-emerald-500/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/5 dark:bg-teal-500/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-lg bg-white/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[4rem] p-16 backdrop-blur-3xl shadow-2xl space-y-12 animate-fade-in relative z-10">
        <div className="text-center space-y-4 relative">
          <button 
            onClick={onBack}
            className="absolute -top-6 -left-6 w-12 h-12 rounded-full flex items-center justify-center text-neutral-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          <button 
            onClick={onToggleTheme}
            className="absolute -top-6 -right-6 w-12 h-12 rounded-full flex items-center justify-center text-neutral-400 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-2 border-emerald-400/50 mb-8 group relative bg-neutral-950 overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <i className="fas fa-chess-knight text-emerald-400 text-5xl relative z-10 animate-float"></i>
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">
            {mode === 'login' ? 'Hobbs Entry' : 'Establish Member'}
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-500 font-bold uppercase tracking-widest italic">
            {mode === 'login' ? 'Strategic Identity Verification Required' : 'Join the elite creative coordination matrix.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'register' && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest px-1">Studio Handle</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-8 py-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner dark:text-white placeholder:text-neutral-700"
                placeholder="Strategist Name"
              />
            </div>
          )}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest px-1">Data Node (Email)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-8 py-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner dark:text-white placeholder:text-neutral-700"
              placeholder="member@hobbsai.com"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest px-1 flex justify-between">
              <span>Security Key</span>
              {mode === 'login' && <span className="text-emerald-600 dark:text-emerald-500 hover:underline cursor-pointer lowercase italic font-bold">Lost Key?</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-8 py-5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner dark:text-white placeholder:text-neutral-700"
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center italic">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-2xl shadow-emerald-900/30 active:scale-95 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <>
                <i className="fas fa-chess-knight fa-spin"></i>
                <span>Verifying Node...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Initiate Sync' : 'Register Identity'}</span>
            )}
          </button>
        </form>

        <div className="text-center">
           <p className="text-[11px] text-neutral-500 dark:text-neutral-600 font-bold uppercase tracking-widest">
             {mode === 'login' ? "New member?" : "Identity established?"}
             <button 
              onClick={() => {}} 
              className="ml-3 text-emerald-600 dark:text-emerald-500 hover:underline italic"
             >
               {mode === 'login' ? 'Establish Access' : 'Authorize Login'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
