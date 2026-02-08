
import React, { useState, useRef, useEffect } from 'react';
import { UserCredits, ScheduledPost, SocialPostPrefill, MovieAnalytics } from '../../types';

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
  const [historyData] = useState([
    { id: 'h1', platform: 'x', title: 'Cyberpunk Tokyo', time: '2 hours ago', reach: '4.2k', likes: 245, engagement: '5.8%', impressions: '8.5k', ctr: '2.1%' },
    { id: 'h2', platform: 'linkedin', title: 'Studio Infrastructure', time: '5 hours ago', reach: '1.8k', likes: 112, engagement: '4.2%', impressions: '3.2k', ctr: '1.5%' },
    { id: 'h3', platform: 'instagram', title: 'Neon Vision Reel', time: 'Yesterday', reach: '12.4k', likes: 1842, engagement: '12.4%', impressions: '25.0k', ctr: '4.8%' },
    { id: 'h4', platform: 'tiktok', title: 'Studio Tour', time: '2 days ago', reach: '45.1k', likes: 5201, engagement: '18.2%', impressions: '82.0k', ctr: '6.2%' },
  ]);

  const [boxOfficeMovies] = useState([
    { 
      id: 'm1', 
      title: 'Neon Vision Master', 
      sales: 4200, 
      profit: 12600,
      duration: 120,
      analytics: {
        ticketsSold: 4200,
        revenue: 21000,
        avgWatchTime: 102,
        completionRate: 85.5,
        avgRating: 4.8,
        dropOffPoint: 110,
        reviews: [
          { id: 'r1', username: 'Visualist99', rating: 5, comment: "Breathtaking visual fidelity. The cinematic lighting is unmatched.", completed: true, watchTime: 120 },
          { id: 'r2', username: 'Director_X', rating: 4.5, comment: "Impressive pacing, though the ending felt a bit compressed.", completed: true, watchTime: 118 },
          { id: 'r3', username: 'AI_Critic', rating: 4.0, comment: "Neural artifacts are non-existent. Pure professional grade.", completed: false, watchTime: 95 }
        ]
      }
    },
    { 
      id: 'm2', 
      title: 'The Neural Shift', 
      sales: 3100, 
      profit: 9300,
      duration: 180,
      analytics: {
        ticketsSold: 3100,
        revenue: 15500,
        avgWatchTime: 145,
        completionRate: 68.2,
        avgRating: 4.2,
        dropOffPoint: 120,
        reviews: [
          { id: 'r4', username: 'TechGuru', rating: 4.5, comment: "Complex narrative, watched it twice to catch all details.", completed: true, watchTime: 180 },
          { id: 'r5', username: 'StudioFan', rating: 3.5, comment: "A bit slow in the middle, but the climax is incredible.", completed: false, watchTime: 130 }
        ]
      }
    },
    { 
      id: 'm3', 
      title: 'Cyber Tokyo', 
      sales: 5150, 
      profit: 15450,
      duration: 90,
      analytics: {
        ticketsSold: 5150,
        revenue: 25750,
        avgWatchTime: 88,
        completionRate: 94.1,
        avgRating: 4.9,
        dropOffPoint: 85,
        reviews: [
          { id: 'r6', username: 'NeoNight', rating: 5, comment: "Perfect length. Every frame is a masterpiece.", completed: true, watchTime: 90 },
          { id: 'r7', username: 'CriticEdge', rating: 5, comment: "The gold standard for Hobbs Studio productions.", completed: true, watchTime: 90 }
        ]
      }
    },
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
    platformSplit: userCredits.tier === 'Enterprise' ? 9337.5 : 24900,
    userProfit: userCredits.tier === 'Enterprise' ? 52912.5 : 37350
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (prefillData) {
      setNewPost(prev => ({
        ...prev,
        title: prefillData.title,
        content: `Mastered production from Hobbs Studio. Quality: Premium.`,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewMedia(prev => [...prev, ...urls]);
    }
  };

  const removeMedia = (index: number) => {
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration;
    setMaxVideoDuration(duration);
    setVideoTrim({ start: 0, end: duration });
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
      ticketPrice: newPost.ticketPrice
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

  const canSellTickets = userCredits.tier !== 'Nano';
  const isVideoInCarousel = previewMedia.some(url => url.includes('video') || url.startsWith('blob:'));

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent theme-transition">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <i className="fas fa-tower-broadcast mr-1"></i> Global Reach
            </div>
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Social Hub</h3>
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
                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Reach</p>
                <p className="text-xl font-black text-neutral-900 dark:text-white italic tracking-tighter">1.2M</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-2">Network Bridges</h4>
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
                <button 
                  onClick={() => toggleConnection(conn.id)}
                  className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    conn.connected 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-500' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xl shadow-emerald-900/20'
                  }`}
                >
                  {conn.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Analytics Hub</h4>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
              {['queue', 'history', 'box-office'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-sm overflow-hidden min-h-[400px]">
            {activeTab === 'box-office' ? (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Your Net Profit</p>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter">${boxOfficeStats.userProfit.toLocaleString()}</p>
                    <p className="text-[9px] text-neutral-500 font-bold mt-2 uppercase tracking-tighter">{userCredits.tier === 'Enterprise' ? '85%' : '60%'} Share</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl">
                    <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-1">Tickets Sold</p>
                    <p className="text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter">{boxOfficeStats.totalTicketsSold.toLocaleString()}</p>
                    <p className="text-[9px] text-neutral-500 font-bold mt-2 uppercase tracking-tighter">Avg Price: $5.00</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Production Performance Breakdown</h5>
                  {boxOfficeMovies.map((movie) => (
                    <div key={movie.id} className="space-y-4">
                      <div 
                        onClick={() => setSelectedMovieAnalytics(selectedMovieAnalytics === movie.id ? null : movie.id)}
                        className={`flex items-center justify-between p-5 bg-neutral-50 dark:bg-black/20 border rounded-2xl cursor-pointer transition-all ${selectedMovieAnalytics === movie.id ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-950/20' : 'border-neutral-100 dark:border-neutral-800/50 hover:bg-emerald-500/5'}`}
                      >
                         <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedMovieAnalytics === movie.id ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <i className="fas fa-clapperboard"></i>
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">{movie.title}</p>
                              <p className="text-[8px] text-neutral-500 font-bold uppercase">{movie.sales.toLocaleString()} Sold • {movie.analytics.avgRating} <i className="fas fa-star text-[7px] text-amber-500"></i></p>
                            </div>
                         </div>
                         <div className="text-right flex items-center space-x-4">
                            <div>
                              <p className="text-sm font-black text-emerald-500 italic">${movie.profit.toLocaleString()}</p>
                              <p className="text-[7px] text-neutral-500 uppercase font-black">Net Accrued</p>
                            </div>
                            <i className={`fas fa-chevron-${selectedMovieAnalytics === movie.id ? 'up' : 'down'} text-[10px] text-neutral-400`}></i>
                         </div>
                      </div>

                      {/* Expanded Analytics Dashboard */}
                      {selectedMovieAnalytics === movie.id && (
                        <div className="p-8 bg-neutral-100 dark:bg-neutral-950 border border-emerald-500/20 rounded-3xl space-y-10 animate-fade-in">
                          <div className="grid grid-cols-3 gap-6">
                             <div className="space-y-1.5">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Neural Retention</p>
                                <p className="text-2xl font-black text-neutral-900 dark:text-white italic tracking-tighter">{movie.analytics.completionRate}%</p>
                                <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-2">
                                   <div className="h-full bg-gradient-to-r from-emerald-600 to-indigo-600" style={{ width: `${movie.analytics.completionRate}%` }}></div>
                                </div>
                             </div>
                             <div className="space-y-1.5 text-center">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Avg Watch-Time</p>
                                <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">{movie.analytics.avgWatchTime}s</p>
                                <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-tighter">Total: {movie.duration}s</p>
                             </div>
                             <div className="space-y-1.5 text-right">
                                <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Drop-Off Node</p>
                                <p className="text-2xl font-black text-indigo-500 italic tracking-tighter">{movie.analytics.dropOffPoint}s</p>
                                <p className="text-[7px] font-bold text-neutral-500 uppercase tracking-tighter">Peak Abandonment</p>
                             </div>
                          </div>

                          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-900 space-y-4">
                             <h6 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Audience Sentiment Rack</h6>
                             <div className="space-y-3">
                                {movie.analytics.reviews.map(review => (
                                  <div key={review.id} className="p-4 bg-white dark:bg-black/40 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
                                     <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight">{review.username}</span>
                                           <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${review.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                              {review.completed ? 'Finished' : `${review.watchTime}s Partial`}
                                           </span>
                                        </div>
                                        <div className="flex space-x-0.5 text-amber-500 text-[8px]">
                                           {[...Array(5)].map((_, i) => (
                                             <i key={i} className={`fas fa-star ${i >= review.rating ? 'opacity-20' : ''}`}></i>
                                           ))}
                                        </div>
                                     </div>
                                     <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed italic">"{review.comment}"</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'history' ? (
              <div className="space-y-6 animate-fade-in">
                {/* Performance Summary Banner */}
                <div className="grid grid-cols-3 gap-3 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                  <div className="text-center p-2 border-r border-neutral-100 dark:border-neutral-800">
                    <p className="text-[7px] font-black text-neutral-400 uppercase mb-1">Avg Engagement</p>
                    <p className="text-sm font-black text-emerald-500 tracking-tighter">10.1%</p>
                  </div>
                  <div className="text-center p-2 border-r border-neutral-100 dark:border-neutral-800">
                    <p className="text-[7px] font-black text-neutral-400 uppercase mb-1">Total Reach</p>
                    <p className="text-sm font-black text-neutral-900 dark:text-white tracking-tighter italic">63.5k</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-[7px] font-black text-neutral-400 uppercase mb-1">Conversion</p>
                    <p className="text-sm font-black text-indigo-500 tracking-tighter">3.6%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {historyData.map((item) => (
                    <div key={item.id} className="p-5 bg-white dark:bg-black/40 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-500">
                            <i className={`fab fa-${item.platform}`}></i>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{item.title}</p>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">{item.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-500 tracking-tighter italic">{item.reach}</p>
                          <p className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">Reach</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-50 dark:border-neutral-900 relative z-10">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black text-neutral-500 uppercase">
                            <span>Likes</span>
                            <span className="text-neutral-900 dark:text-white">{item.likes}</span>
                          </div>
                          <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-[60%]" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black text-neutral-500 uppercase">
                            <span>Impressions</span>
                            <span className="text-neutral-900 dark:text-white">{item.impressions}</span>
                          </div>
                          <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[75%]" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black text-neutral-500 uppercase">
                            <span>CTR</span>
                            <span className="text-emerald-500">{item.ctr}</span>
                          </div>
                          <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                             <div className="h-full bg-teal-500 w-[40%]" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[7px] font-black text-emerald-500 uppercase">
                           {item.engagement} Engagement
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em] hover:text-emerald-500 transition">View Full Platform Sync Report</button>
              </div>
            ) : (
              <div className="space-y-6">
                {scheduledPosts.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                    <i className="fas fa-calendar-clock text-4xl"></i>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue Standby</p>
                  </div>
                ) : (
                  scheduledPosts.map((post) => (
                    <div key={post.id} className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-4 relative group animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <i className={`fab fa-${post.platform}`}></i>
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">{post.title}</p>
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                              <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Scheduled: {new Date(post.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteScheduledPost(post.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <i className="fas fa-trash-can text-[10px]"></i>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed italic line-clamp-2">
                        "{post.content}"
                      </p>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="flex items-center space-x-2 overflow-hidden">
                           {post.mediaUrls.slice(0, 4).map((url, i) => (
                             <div key={i} className="rounded-xl overflow-hidden h-16 w-16 border border-neutral-800 shrink-0 relative">
                                {url.includes('video') || url.startsWith('blob:') ? (
                                  <div className="w-full h-full bg-black/20 flex items-center justify-center text-emerald-500">
                                     <i className="fas fa-film text-[10px]"></i>
                                  </div>
                                ) : (
                                  <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Scheduled media" />
                                )}
                                {i === 3 && post.mediaUrls.length > 4 && (
                                   <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[8px] font-black text-white">+{post.mediaUrls.length - 4}</div>
                                )}
                             </div>
                           ))}
                           {post.videoTrim && (
                              <div className="bg-emerald-600/10 border border-emerald-600/20 px-2 py-1 rounded-lg">
                                 <p className="text-[7px] font-black text-emerald-500 uppercase">Trim: {post.videoTrim.start.toFixed(1)}s - {post.videoTrim.end.toFixed(1)}s</p>
                              </div>
                           )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
            {/* Media Prep Area */}
            <div className="md:w-2/5 bg-neutral-100 dark:bg-black border-r border-neutral-200 dark:border-neutral-800 p-8 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-1">Studio Assets Rack</h5>
                <button onClick={() => fileInputRef.current?.click()} className="text-[8px] font-black bg-emerald-600 text-white px-3 py-1 rounded-full uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg">Add Asset</button>
              </div>

              <div className="flex-1 space-y-6">
                {previewMedia.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition group shadow-sm"
                  >
                    <i className="fas fa-cloud-arrow-up text-3xl text-neutral-300 dark:text-neutral-800 mb-4"></i>
                    <p className="text-[9px] font-black uppercase text-neutral-400">Import Master Content</p>
                    <p className="text-[7px] text-neutral-500 uppercase mt-1">Images or Videos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {previewMedia.map((url, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative group animate-fade-in shadow-md">
                        {url.includes('video') || url.startsWith('blob:') ? (
                           <video src={url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                           <img src={url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                           <button onClick={() => removeMedia(i)} className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shadow-xl transform active:scale-95 transition">
                              <i className="fas fa-trash"></i>
                           </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter">NODE 0{i+1}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                {isVideoInCarousel && (
                  <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-6 animate-fade-in shadow-inner">
                    <div className="flex items-center space-x-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                       <i className="fas fa-scissors text-emerald-500"></i>
                       <h6 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest">Temporal Trimming Rack</h6>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                         <video 
                           ref={videoPreviewRef}
                           src={previewMedia.find(url => url.includes('video') || url.startsWith('blob:'))} 
                           onLoadedMetadata={handleVideoMetadata}
                           className="w-full h-full object-contain"
                           muted
                         />
                      </div>
                      
                      <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400">
                            <span>In-Point (Start)</span>
                            <span className="text-emerald-500">{videoTrim.start.toFixed(1)}s</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max={videoTrim.end} 
                            step="0.1" 
                            value={videoTrim.start}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setVideoTrim({...videoTrim, start: val});
                              if (videoPreviewRef.current) videoPreviewRef.current.currentTime = val;
                            }}
                            className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none accent-emerald-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400">
                            <span>Out-Point (End)</span>
                            <span className="text-emerald-500">{videoTrim.end.toFixed(1)}s</span>
                          </div>
                          <input 
                            type="range" 
                            min={videoTrim.start} 
                            max={maxVideoDuration} 
                            step="0.1" 
                            value={videoTrim.end}
                            onChange={(e) => setVideoTrim({...videoTrim, end: parseFloat(e.target.value)})}
                            className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input type="file" hidden multiple ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" />
            </div>

            <div className="md:w-3/5 p-12 flex flex-col space-y-10 bg-white dark:bg-neutral-950 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">Post Architecture</h4>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Calibrate global broadcast parameters</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all border border-neutral-100 dark:border-neutral-800">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSchedulePost} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Network Switch</label>
                    <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                      {connections.map(conn => (
                        <button
                          key={conn.id}
                          type="button"
                          disabled={!conn.connected}
                          onClick={() => setNewPost({ ...newPost, platform: conn.id })}
                          className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${newPost.platform === conn.id ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-md border border-neutral-200 dark:border-neutral-700' : 'text-neutral-400 opacity-40 hover:opacity-100'} ${!conn.connected && 'cursor-not-allowed opacity-10'}`}
                        >
                          <i className={conn.icon}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1 italic">Neural Timing Map</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={newPost.scheduledTime}
                      onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
                      className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-3 text-[11px] font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-black/50 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-900 shadow-inner space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Box Office Monetization</label>
                    <button 
                      type="button"
                      disabled={!canSellTickets}
                      onClick={() => setNewPost({ ...newPost, isTicketed: !newPost.isTicketed })}
                      className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${newPost.isTicketed ? 'bg-emerald-600 text-white shadow-lg' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'} ${!canSellTickets && 'opacity-30'}`}
                    >
                      {newPost.isTicketed ? 'Ticketed Access Enabled' : 'Public Access Mode'}
                    </button>
                  </div>
                  
                  {newPost.isTicketed && (
                    <div className="grid grid-cols-2 gap-8 animate-fade-in">
                       <div className="space-y-2">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase px-1">Ticket Value ($)</span>
                          <input 
                            type="number" 
                            step="0.50" 
                            value={newPost.ticketPrice} 
                            onChange={e => setNewPost({...newPost, ticketPrice: parseFloat(e.target.value)})} 
                            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 py-3 text-[12px] font-black text-emerald-500 focus:outline-none" 
                          />
                       </div>
                       <div className="space-y-2 text-right flex flex-col justify-end">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase px-1">Net Projection</span>
                          <span className="text-xl font-black text-white italic tracking-tighter">${((newPost.ticketPrice || 0) * (userCredits.tier === 'Enterprise' ? 0.85 : 0.60)).toFixed(2)} / Ticket</span>
                       </div>
                    </div>
                  )}
                  {!canSellTickets && <p className="text-[8px] text-neutral-500 font-bold uppercase text-center italic">Requires Studio Pro or Elite Infrastructure.</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Broadcast Identity</label>
                  <input 
                    type="text" 
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter production title or reference..."
                    className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-[12px] font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Global Script Content</label>
                  <textarea
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Describe the narrative for this broadcast node..."
                    className="w-full h-40 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-[14px] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner font-medium leading-relaxed resize-none"
                  />
                </div>

                <div className="pt-6 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-200 transition border border-neutral-200 dark:border-neutral-800"
                  >
                    Purge Draft
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center space-x-4 group"
                  >
                    <i className="fas fa-tower-broadcast transition-transform group-hover:scale-110"></i>
                    <span>Authorize & Commit</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
    </div>
  );
};

export default SocialHub;
