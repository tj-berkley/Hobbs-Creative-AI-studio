
import React, { useState, useRef, useEffect } from 'react';
import { UserCredits, ScheduledPost, SocialPostPrefill, MovieAnalytics } from '../../types.ts';

interface SocialHubProps {
  userCredits: UserCredits;
  prefillData?: SocialPostPrefill | null;
  onClearPrefill?: () => void;
}

const SocialHub: React.FC<SocialHubProps> = ({ userCredits, prefillData, onClearPrefill }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'queue' | 'box-office'>('queue');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieAnalytics, setSelectedMovieAnalytics] = useState<string | null>(null);

  const [connections, setConnections] = useState([
    { id: 'x', name: 'X / Twitter', icon: 'fab fa-x-twitter', connected: true, username: '@HobbsStudio' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', connected: false, username: null },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', connected: true, username: 'Hobbs Strategic' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', connected: false, username: null },
  ]);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  
  // Calculate profits based on tier
  const getUserProfit = (gross: number) => {
    if (userCredits.tier === 'Enterprise') return gross * 0.94;
    if (userCredits.tier === 'Studio Pro') return gross * 0.75;
    return gross * 0.60; // Beginner gets 60%, Platform gets 40%
  };

  const [boxOfficeMovies] = useState([
    { 
      id: 'm1', 
      title: 'Neon Vision Master', 
      sales: 4200, 
      profit: getUserProfit(21000), 
      duration: 120,
      hasPodcast: true,
      analytics: {
        ticketsSold: 4200,
        revenue: 21000,
        avgWatchTime: 102,
        completionRate: 85.5,
        avgRating: 4.8,
        dropOffPoint: 110,
        reviews: [
          { id: 'r1', username: 'Visualist99', rating: 5, comment: "Breathtaking visual fidelity.", completed: true, watchTime: 120 },
          { id: 'r2', username: 'Director_X', rating: 4.5, comment: "Impressive pacing.", completed: true, watchTime: 118 }
        ]
      }
    }
  ]);

  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({
    platform: 'x',
    title: '',
    content: '',
    scheduledTime: '',
    isTicketed: false,
    ticketPrice: 5.00,
    mediaUrls: []
  });

  const [previewMedia, setPreviewMedia] = useState<string[]>([]);
  const [videoTrim, setVideoTrim] = useState<{ start: number, end: number }>({ start: 0, end: 0 });
  const [maxVideoDuration, setMaxVideoDuration] = useState(0);
  
  const [boxOfficeStats] = useState({
    totalTicketsSold: 12450,
    revenueGross: 62250,
    platformSplit: userCredits.tier === 'Enterprise' ? 3735 : userCredits.tier === 'Studio Pro' ? 15562.5 : 24900,
    userProfit: getUserProfit(62250)
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefillData) {
      setNewPost(prev => ({
        ...prev,
        title: prefillData.title,
        content: `Mastered production from Hobbs Studio. Includes ${prefillData.podcastUrl ? 'Companion Podcast' : 'Cinematic Master'}.`,
        scheduledTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        mediaUrls: [prefillData.mediaUrl]
      }));
      setPreviewMedia([prefillData.mediaUrl]);
      setIsModalOpen(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillData, onClearPrefill]);

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, connected: !conn.connected, username: !conn.connected ? '@NewUser' : null } : conn
    ));
  };

  const handleSchedulePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.scheduledTime) return;

    const post: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      platform: newPost.platform || 'x',
      title: newPost.title,
      content: newPost.content || '',
      scheduledTime: newPost.scheduledTime,
      status: 'pending',
      mediaUrls: previewMedia,
      videoTrim: previewMedia.some(url => url.includes('video') || url.startsWith('blob:')) ? videoTrim : undefined,
      isTicketed: newPost.isTicketed,
      ticketPrice: newPost.ticketPrice,
      hasPodcast: !!prefillData?.podcastUrl
    };

    setScheduledPosts(prev => [post, ...prev]);
    resetModal();
    setIsModalOpen(false);
    setActiveTab('queue');
  };

  const resetModal = () => {
    setNewPost({ platform: 'x', title: '', content: '', scheduledTime: '', isTicketed: false, ticketPrice: 5.00, mediaUrls: [] });
    setPreviewMedia([]);
    setVideoTrim({ start: 0, end: 0 });
    setMaxVideoDuration(0);
  };

  const deleteScheduledPost = (id: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== id));
  };

  const canSellTickets = true;

  const currentPlatformCut = userCredits.tier === 'Enterprise' ? 0.06 : userCredits.tier === 'Studio Pro' ? 0.25 : 0.40;

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent theme-transition">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <i className="fas fa-tower-broadcast mr-1"></i> Global Reach
            </div>
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Box Office Hub</h3>
          </div>
          
          <div className="flex space-x-4">
             <button 
              onClick={() => { resetModal(); setIsModalOpen(true); }}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-xl shadow-emerald-900/20 flex items-center space-x-3"
             >
                <i className="fas fa-calendar-plus"></i>
                <span>Schedule Broadcast</span>
             </button>
             <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm text-center hidden md:block">
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Yield</p>
                <p className="text-xl font-black text-neutral-900 dark:text-white italic tracking-tighter">${boxOfficeStats.userProfit.toLocaleString()}</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-2">Production Network</h4>
          <div className="grid grid-cols-1 gap-4">
            {connections.map(conn => (
              <div key={conn.id} className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 ${conn.connected ? 'bg-neutral-950 border-emerald-500/40 text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-400'}`}>
                    <i className={conn.icon}></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase text-neutral-900 dark:text-white tracking-widest">{conn.name}</p>
                    <p className={`text-[9px] font-bold uppercase mt-1 ${conn.connected ? 'text-emerald-500' : 'text-neutral-500'}`}>
                      {conn.connected ? conn.username : 'Disconnected'}
                    </p>
                  </div>
                </div>
                <button onClick={() => toggleConnection(conn.id)} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${conn.connected ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-500' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>{conn.connected ? 'Disconnect' : 'Connect'}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Revenue Analytics</h4>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
              {['queue', 'history', 'box-office'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>{tab.replace('-', ' ')}</button>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-sm overflow-hidden min-h-[400px]">
            {activeTab === 'box-office' ? (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Total Net Profit</p>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter">${boxOfficeStats.userProfit.toLocaleString()}</p>
                    <p className="text-[9px] text-neutral-500 font-bold mt-2 uppercase tracking-tighter">{((1 - currentPlatformCut) * 100).toFixed(0)}% User Split</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl">
                    <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Active Premieres</p>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter">12</p>
                    <p className="text-[9px] text-neutral-500 font-bold mt-2 uppercase tracking-tighter">Avg Ticket: $5.00</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Master Production Registry</h5>
                  {boxOfficeMovies.map((movie) => (
                    <div key={movie.id} className="space-y-4">
                      <div onClick={() => setSelectedMovieAnalytics(selectedMovieAnalytics === movie.id ? null : movie.id)} className={`flex items-center justify-between p-5 bg-neutral-50 dark:bg-black/20 border rounded-2xl cursor-pointer transition-all ${selectedMovieAnalytics === movie.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-100 dark:border-neutral-800/50 hover:bg-emerald-500/5'}`}>
                         <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedMovieAnalytics === movie.id ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <i className="fas fa-clapperboard"></i>
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">{movie.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-[8px] text-neutral-500 font-bold uppercase">{movie.sales.toLocaleString()} Sold</p>
                                {movie.hasPodcast && <span className="text-[7px] font-black bg-indigo-600/10 text-indigo-500 px-2 py-0.5 rounded uppercase border border-indigo-600/20 italic"><i className="fas fa-podcast mr-1"></i>Enhanced Release</span>}
                              </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-emerald-500 italic">${movie.profit.toLocaleString()}</p>
                            <p className="text-[7px] text-neutral-500 uppercase font-black">Net Earned</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] italic opacity-20">Analytics Engine Idle</div>
            )}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 w-full max-w-lg rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <div className="space-y-2">
                 <h4 className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">Box Office Launch</h4>
                 <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Release production to public network</p>
              </div>

              <form onSubmit={handleSchedulePost} className="space-y-8">
                 <div className="p-8 bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-inner space-y-6">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Enhanced Premiere Mode</label>
                       <div className="w-10 h-5 bg-emerald-600 rounded-full relative">
                          <div className="absolute top-1 left-6 w-3 h-3 bg-white rounded-full"></div>
                       </div>
                    </div>
                    {prefillData?.podcastUrl && (
                      <div className="p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl flex items-center space-x-4">
                         <i className="fas fa-podcast text-indigo-500"></i>
                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Companion Podcast Included in Bundle</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase">Ticket Price</span>
                          <input type="number" value={newPost.ticketPrice} onChange={e => setNewPost({...newPost, ticketPrice: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 py-3 text-[12px] font-black text-emerald-500 focus:outline-none" />
                       </div>
                       <div className="space-y-2 text-right">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase">Your Share ({((1 - currentPlatformCut) * 100).toFixed(0)}%)</span>
                          <span className="text-xl font-black text-white italic block">${((newPost.ticketPrice || 0) * (1 - currentPlatformCut)).toFixed(2)}</span>
                       </div>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center space-x-3">
                    <i className="fas fa-rocket"></i>
                    <span>Initiate Premiere</span>
                 </button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-[9px] font-black text-neutral-400 uppercase tracking-widest hover:text-red-500 transition">Cancel Deployment</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SocialHub;
