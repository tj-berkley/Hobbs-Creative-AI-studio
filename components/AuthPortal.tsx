
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
        setError('Please fill in all fields.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden theme-transition">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 dark:bg-purple-600/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] p-12 backdrop-blur-2xl shadow-2xl space-y-10 animate-fade-in relative z-10">
        <div className="text-center space-y-3 relative">
          <button 
            onClick={onBack}
            className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          <button 
            onClick={onToggleTheme}
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-indigo-600 dark:hover:text-white transition"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6">
            <i className="fas fa-crown text-white"></i>
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">
            {mode === 'login' ? 'Studio Access' : 'Create Identity'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Welcome back to the studio.' : 'Join the elite creative collective.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner dark:text-white"
                placeholder="John Doe"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Email Node</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner dark:text-white"
              placeholder="name@platform.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex justify-between">
              <span>Access Key</span>
              {mode === 'login' && <span className="text-indigo-600 dark:text-indigo-500 hover:underline cursor-pointer lowercase italic">Forgot?</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>Synchronizing...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Authenticate' : 'Establish Identity'}</span>
            )}
          </button>
        </form>

        <div className="text-center">
           <p className="text-[10px] text-neutral-500 dark:text-neutral-600 font-bold uppercase tracking-widest">
             {mode === 'login' ? "Don't have access?" : "Already have an account?"}
             <button 
              onClick={() => {}} // In a real app, toggle mode
              className="ml-2 text-indigo-600 dark:text-indigo-500 hover:underline"
             >
               {mode === 'login' ? 'Apply Now' : 'Login'}
             </button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
