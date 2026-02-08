
import React, { useState, useRef, useEffect } from 'react';
import { MovieClip, PersonalityProfile, UserCredits, SocialPostPrefill, MovieAnalytics, ScriptProject, ScriptScene } from '../../types';
import BroadcastModal from '../BroadcastModal';
import { GeminiService } from '../../services/geminiService';

interface MovieStudioProps {
  userCredits: UserCredits;
  onShareToSocialHub: (data: SocialPostPrefill) => void;
  pendingScriptProject?: ScriptProject | null;
  onClearPendingProject?: () => void;
}

const MovieStudio: React.FC<MovieStudioProps> = ({ userCredits, onShareToSocialHub, pendingScriptProject, onClearPendingProject }) => {
  const [viewMode, setViewMode] = useState<'editor' | 'intelligence'>('editor');
  const [clips, setClips] = useState<MovieClip[]>([]);
  const [timeline, setTimeline] = useState<MovieClip[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [isMastering, setIsMastering] = useState(false);
  const [masterProgress, setMasterProgress] = useState(0);
  const [masteringStatus, setMasteringStatus] = useState('');
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [moviePoster, setMoviePoster] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonalityProfile | null>(null);
  
  // Script Processing State
  const [isProcessingScript, setIsProcessingScript] = useState(false);
  const [currentProcessingSceneIndex, setCurrentProcessingSceneIndex] = useState(0);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Mock data for analytics demonstration
  const [masteredProductions] = useState([
    {
      id: 'p1',
      title: 'Neon Odyssey: Tokyo Drift',
      thumbnail: 'https://images.unsplash.com/photo-1542204172-3a8a3a3d5f0e?auto=format&fit=crop&q=80&w=300',
      analytics: {
        ticketsSold: 8420,
        revenue: 42100,
        avgWatchTime: 142,
        completionRate: 88.4,
        avgRating: 4.9,
        dropOffPoint: 155,
        reviews: [
          { id: 'r1', username: 'CritiqueCore', rating: 5, comment: "The neural sync in the third act is perfection.", watchTime: 180, completed: true },
          { id: 'r2', username: 'StudioFan_X', rating: 4, comment: "Incredible visuals, but some lighting artifacts near 2m.", watchTime: 160, completed: true }
        ]
      }
    }
  ]);

  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(masteredProductions[0].id);
  const activeProduction = masteredProductions.find(p => p.id === selectedProductionId);

  // Background Music
  const [backgroundMusic, setBackgroundMusic] = useState<{url: string, name: string} | null>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Automatically process pending script project
  useEffect(() => {
    if (pendingScriptProject) {
      handleProcessScript(pendingScriptProject);
      if (onClearPendingProject) onClearPendingProject();
    }
  }, [pendingScriptProject]);

  const handleProcessScript = async (project: ScriptProject) => {
    setIsProcessingScript(true);
    setMasteringStatus(`Initializing Studio Core for: ${project.title}`);
    
    const newTimeline: MovieClip[] = [];
    
    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i];
      setCurrentProcessingSceneIndex(i);
      setMasteringStatus(`Rendering Scene node ${i + 1}/${project.scenes.length}: ${scene.setting}`);
      
      try {
        const videoUrl = await GeminiService.generateVideo(
          scene.visualDirective, 
          '16:9', 
          undefined, 
          '720p'
        );
        
        // Generate a thumbnail from the URL
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.currentTime = 0.5;
        
        const clip: MovieClip = await new Promise((resolve) => {
           video.onloadeddata = () => {
              const canvas = document.createElement('canvas');
              canvas.width = 320;
              canvas.height = 180;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              resolve({
                id: Math.random().toString(36).substr(2, 9),
                url: videoUrl,
                name: `Scene ${i+1}: ${scene.setting}`,
                duration: video.duration || scene.estimatedDuration,
                thumbnail: canvas.toDataURL('image/jpeg'),
                lipsyncScript: scene.dialogue,
                startTime: 0,
                endTime: video.duration || scene.estimatedDuration
              });
           };
        });

        newTimeline.push(clip);
        // Live update timeline so the user sees progress
        setTimeline([...newTimeline]);
      } catch (err) {
        console.error("Failed to render scene node", err);
      }
    }

    setIsProcessingScript(false);
    setMasteringStatus('');
    alert(`Production Complete: ${project.title} has been mastered into ${newTimeline.length} scene nodes.`);
  };

  // Handle sequence playback
  useEffect(() => {
    if (isPlaying && timeline.length > 0) {
      const currentClip = timeline[currentTimelineIndex];
      if (videoPreviewRef.current) {
        if (videoPreviewRef.current.src !== currentClip.url) {
          videoPreviewRef.current.src = currentClip.url;
        }
        videoPreviewRef.current.currentTime = currentClip.startTime || 0;
        videoPreviewRef.current.play();
      }
    } else if (!isPlaying && videoPreviewRef.current) {
      videoPreviewRef.current.pause();
    }
  }, [isPlaying, currentTimelineIndex, timeline]);

  const handleTimeUpdate = () => {
    if (!isPlaying || timeline.length === 0 || !videoPreviewRef.current) return;
    const currentClip = timeline[currentTimelineIndex];
    const endTime = currentClip.endTime || currentClip.duration;
    
    if (videoPreviewRef.current.currentTime >= endTime) {
      handleVideoEnded();
    }
  };

  const handleVideoEnded = () => {
    if (currentTimelineIndex < timeline.length - 1) {
      setCurrentTimelineIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentTimelineIndex(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = "anonymous";
        video.currentTime = 1;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const newClip: MovieClip = {
            id: Math.random().toString(36).substr(2, 9),
            url: url,
            name: file.name,
            duration: video.duration || 0,
            thumbnail: canvas.toDataURL('image/jpeg'),
            startTime: 0,
            endTime: video.duration || 0
          };
          setClips(prev => [...prev, newClip]);
        };
      });
    }
  };

  const generateAIPoster = async () => {
    if (timeline.length === 0 || isGeneratingPoster) return;
    setIsGeneratingPoster(true);
    setMasteringStatus('Designing Cinematic One-Sheet...');
    try {
      const scriptLines = timeline.map(c => c.lipsyncScript).filter(Boolean).join(' ');
      const posterPrompt = `High-end cinematic movie poster for a film featuring these themes: ${scriptLines || 'A high-performance drama from Hobbs Studio'}. Ultra-realistic, 8k, dramatic lighting, epic composition.`;
      const posterUrl = await GeminiService.generateImage(posterPrompt, { aspectRatio: '2:3', imageSize: '2K' });
      setMoviePoster(posterUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPoster(false);
      setMasteringStatus('');
    }
  };

  const generateAIScript = async () => {
    if (timeline.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setMasteringStatus('Architecting Neural Narrative...');
    try {
      const characters = timeline.map((c, i) => ({ index: i, ...c.personality }));
      const script = await GeminiService.generateMovieScript(characters);
      setTimeline(prev => prev.map((c, i) => {
        const line = script.find((s: any) => s.index === i);
        return line ? { ...c, lipsyncScript: line.dialogue } : c;
      }));
      setMasteringStatus('Script Sync Complete.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setMasteringStatus(''), 2000);
    }
  };

  const performCharacterAnalysis = async (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || isAnalyzing) return;

    setIsAnalyzing(true);
    setMasteringStatus('Extracting Persona Fingerprint...');
    
    try {
      const response = await fetch(clip.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const personality = await GeminiService.analyzeCharacter(base64, blob.type);
        setClips(prev => prev.map(c => c.id === clipId ? { ...c, personality } : c));
        setTimeline(prev => prev.map(c => c.id === clipId ? { ...c, personality } : c));
        setSelectedPersona(personality);
        setMasteringStatus('Acoustic & Kinetic Calibration Complete.');
      }
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setMasteringStatus(''), 2000);
    }
  };

  const addToTimeline = (clip: MovieClip) => {
    setTimeline(prev => [...prev, { 
      ...clip, 
      id: Math.random().toString(36).substr(2, 9),
      startTime: 0,
      endTime: clip.duration
    }]);
  };

  const updateScript = (index: number, script: string) => {
    setTimeline(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], lipsyncScript: script };
      return updated;
    });
  };

  const updateTrimming = (index: number, start: number, end: number) => {
    setTimeline(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], startTime: start, endTime: end };
      return updated;
    });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) { setDraggedIndex(null); setDragOverIndex(null); return; }
    const newTimeline = [...timeline];
    const [movedItem] = newTimeline.splice(draggedIndex, 1);
    newTimeline.splice(index, 0, movedItem);
    setTimeline(newTimeline);
    setDraggedIndex(null);
    setDragOverIndex(null);
    if (isPlaying) { setIsPlaying(false); setCurrentTimelineIndex(0); }
  };

  const handleReleaseToPublic = () => {
    if (timeline.length === 0) return;
    onShareToSocialHub({
       mediaUrl: moviePoster || timeline[0].thumbnail,
       title: "Master Production: " + (activeProduction?.title || "Untitled Masterpiece"),
       type: 'video'
    });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white overflow-hidden relative theme-transition">
      {/* Script Processing Overlay */}
      {isProcessingScript && (
        <div className="absolute inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-fade-in">
           <div className="relative w-32 h-32 mb-12">
             <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-clapperboard text-emerald-500 text-4xl animate-pulse"></i>
             </div>
           </div>
           <div className="space-y-4 max-w-md">
             <h5 className="text-2xl font-black italic uppercase tracking-tighter text-white">{masteringStatus}</h5>
             <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentProcessingSceneIndex + 1) / (pendingScriptProject?.scenes.length || 1)) * 100}%` }}></div>
             </div>
             <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest italic">Neural nodes are synthesizing frame-by-frame sequences. Large productions are automatically broken into scene clusters for stability.</p>
           </div>
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-4 border-b border-neutral-200 dark:border-neutral-900 flex items-center justify-between bg-white dark:bg-black/20">
           <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <button onClick={() => setViewMode('editor')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'editor' ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-md' : 'text-neutral-500'}`}>Production Editor</button>
              <button onClick={() => setViewMode('intelligence')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'intelligence' ? 'bg-white dark:bg-neutral-800 text-emerald-500 shadow-md' : 'text-neutral-500'}`}>Studio Intelligence</button>
           </div>
           <div className="flex items-center space-x-3">
              <button onClick={handleReleaseToPublic} disabled={timeline.length === 0} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95">Public Release</button>
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-emerald-500 transition px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">Import Node</button>
              <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileUpload} accept="video/*" />
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'editor' ? (
            <>
              <aside className="w-80 border-r border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black/40 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Scene Bin</h4>
                <div className="space-y-4">
                  {clips.map(clip => (
                    <div key={clip.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-emerald-500/50 transition-all shadow-sm">
                      <img src={clip.thumbnail} className="w-full h-24 object-cover opacity-60 group-hover:opacity-100 transition" />
                      <div className="p-3">
                        <p className="text-[9px] font-black uppercase truncate text-neutral-800 dark:text-neutral-200">{clip.name}</p>
                        <div className="mt-3 flex space-x-2">
                           <button onClick={() => addToTimeline(clip)} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add to Timeline</button>
                           <button onClick={() => performCharacterAnalysis(clip.id)} className="w-8 h-8 bg-neutral-950 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-fingerprint"></i></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              <main className="flex-1 bg-neutral-100 dark:bg-black p-12 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-5xl aspect-video bg-neutral-950 rounded-[3rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden group">
                  {timeline.length > 0 ? (
                    <video ref={videoPreviewRef} className="w-full h-full object-contain" onEnded={handleVideoEnded} onTimeUpdate={handleTimeUpdate} muted />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
                      <i className="fas fa-film text-6xl opacity-20"></i>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Empty Studio Canvas</p>
                    </div>
                  )}
                  {isPlaying && timeline[currentTimelineIndex]?.lipsyncScript && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 px-8 py-3 rounded-2xl text-emerald-500 font-black text-xl text-center max-w-[85%] backdrop-blur-md border border-white/5 shadow-2xl italic">"{timeline[currentTimelineIndex].lipsyncScript}"</div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-2xl shadow-2xl transform active:scale-95 transition text-white">
                      <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mt-12 flex items-center space-x-6">
                   <button onClick={generateAIScript} disabled={timeline.length === 0} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition shadow-xl shadow-indigo-900/20 active:scale-95">Neural Narrative Generator</button>
                   <button onClick={generateAIPoster} disabled={timeline.length === 0} className="px-8 py-4 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition shadow-xl active:scale-95">Master One-Sheet Art</button>
                </div>
              </main>
            </>
          ) : (
            <div className="flex-1 flex overflow-hidden bg-neutral-100 dark:bg-black animate-fade-in">
              <aside className="w-96 border-r border-neutral-200 dark:border-neutral-900 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                <header className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Catalog Registry</h4>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase">Select production for deep audit</p>
                </header>
                <div className="space-y-4">
                   {masteredProductions.map(prod => (
                     <div key={prod.id} onClick={() => setSelectedProductionId(prod.id)} className={`p-4 rounded-3xl border cursor-pointer transition-all ${selectedProductionId === prod.id ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
                       <div className="flex items-center space-x-4">
                          <img src={prod.thumbnail} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-black uppercase truncate tracking-tight">{prod.title}</p>
                             <p className={`text-[8px] font-bold uppercase mt-1 ${selectedProductionId === prod.id ? 'text-emerald-200' : 'text-neutral-500'}`}>{prod.analytics.ticketsSold.toLocaleString()} Tickets Sold</p>
                          </div>
                       </div>
                     </div>
                   ))}
                </div>
              </aside>

              <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                 {activeProduction ? (
                   <div className="max-w-6xl mx-auto space-y-12">
                      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                         <div className="space-y-2">
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Master Performance Audit</div>
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter">{activeProduction.title}</h3>
                         </div>
                      </header>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-2">
                            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Gross Revenue</p>
                            <p className="text-3xl font-black italic text-emerald-500 tracking-tighter">${activeProduction.analytics.revenue.toLocaleString()}</p>
                         </div>
                         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-2">
                            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Retention Score</p>
                            <p className="text-3xl font-black italic text-neutral-900 dark:text-white tracking-tighter">{activeProduction.analytics.completionRate}%</p>
                         </div>
                         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-2">
                            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Engagement Depth</p>
                            <p className="text-3xl font-black italic text-indigo-500 tracking-tighter">{activeProduction.analytics.avgWatchTime}s</p>
                         </div>
                         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-2">
                            <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Neural Rating</p>
                            <p className="text-3xl font-black italic text-amber-500 tracking-tighter">{activeProduction.analytics.avgRating}/5.0</p>
                         </div>
                      </div>
                   </div>
                 ) : null}
              </main>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Bar */}
      {viewMode === 'editor' && (
        <footer className="h-64 border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black/60 flex flex-col shrink-0 theme-transition">
           <div className="px-8 py-3 border-b border-neutral-200 dark:border-neutral-900 flex justify-between items-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              <div className="flex items-center space-x-4"><span>Timeline Sequence</span><span className="text-[8px] font-black bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">Drag to Reorder</span></div>
              <span className="text-emerald-500">{timeline.length} Scene Nodes</span>
           </div>
           <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center px-8 space-x-4">
              {timeline.map((clip, idx) => (
                <div key={`${clip.id}-${idx}`} className={`w-64 shrink-0 group animate-fade-in relative transition-all duration-300 ${draggedIndex === idx ? 'opacity-30 grayscale' : 'opacity-100'}`} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={() => handleDrop(idx)}>
                   <div className={`rounded-2xl overflow-hidden border-2 transition-all relative cursor-grab active:cursor-grabbing ${currentTimelineIndex === idx && isPlaying ? 'border-emerald-500 shadow-xl' : 'border-neutral-200 dark:border-neutral-800'}`}>
                      <img src={clip.thumbnail} className="w-full h-28 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                         <button onClick={() => setEditingClipId(editingClipId === clip.id ? null : clip.id)} className="p-3 bg-emerald-600 rounded-xl text-white"><i className="fas fa-edit text-xs"></i></button>
                         <button onClick={() => setTimeline(prev => prev.filter((_, i) => i !== idx))} className="p-3 bg-red-600 rounded-xl text-white"><i className="fas fa-trash-can text-xs"></i></button>
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-black text-white">0{idx + 1}</div>
                   </div>
                   {editingClipId === clip.id && (
                     <div className="absolute -top-64 inset-x-0 bg-white dark:bg-neutral-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl z-20 space-y-4 animate-fade-in min-w-[280px]">
                        <textarea value={clip.lipsyncScript || ''} onChange={(e) => updateScript(idx, e.target.value)} placeholder="Character dialogue..." className="w-full h-32 bg-neutral-50 dark:bg-black rounded-xl p-4 text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 shadow-inner resize-none" />
                     </div>
                   )}
                </div>
              ))}
           </div>
        </footer>
      )}

      {/* Mastering Overlay */}
      {(isAnalyzing || isGeneratingPoster) && (
        <div className="absolute inset-0 z-[200] bg-white/95 dark:bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-fade-in">
           <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
           <h5 className="text-xl font-black italic uppercase tracking-tighter mb-4">{masteringStatus}</h5>
        </div>
      )}
    </div>
  );
};

export default MovieStudio;
