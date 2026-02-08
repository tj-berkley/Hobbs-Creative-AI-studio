
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiService } from '../../services/geminiService';
import BroadcastModal from '../BroadcastModal';

interface VisualFilter {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptAddition: string;
  cssFilter: string;
}

const FILTERS: VisualFilter[] = [
  { 
    id: 'none', 
    name: 'Raw', 
    icon: 'fa-ban', 
    description: 'Original style', 
    promptAddition: '',
    cssFilter: 'none'
  },
  { 
    id: 'cinematic', 
    name: 'Cinematic', 
    icon: 'fa-clapperboard', 
    description: 'Pro color grading & lighting', 
    promptAddition: 'Apply professional cinematic color grading, high dynamic range, and dramatic lighting.',
    cssFilter: 'contrast(1.1) saturate(1.2) brightness(1.05)'
  },
  { 
    id: 'vintage', 
    name: 'Vintage', 
    icon: 'fa-camera-retro', 
    description: '70s film aesthetic', 
    promptAddition: 'Transform into a 1970s vintage film aesthetic with grainy texture, warm faded colors, and subtle light leaks.',
    cssFilter: 'sepia(0.3) contrast(0.9) brightness(1.1) saturate(0.8)'
  },
  { 
    id: 'noir', 
    name: 'Noir', 
    icon: 'fa-moon', 
    description: 'Black & white drama', 
    promptAddition: 'Convert to a classic film noir style: high contrast black and white, deep dramatic shadows, and atmospheric smoke.',
    cssFilter: 'grayscale(1) contrast(1.5) brightness(0.9)'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    icon: 'fa-bolt', 
    description: 'Neon futuristic', 
    promptAddition: 'Infuse with a cyberpunk aesthetic: vibrant neon lights, magenta and teal color palette, digital glitch artifacts, and rainy night atmosphere.',
    cssFilter: 'hue-rotate(-20deg) saturate(1.5) contrast(1.2) brightness(0.9)'
  },
  { 
    id: 'anime', 
    name: 'Ghibli', 
    icon: 'fa-paint-brush', 
    description: 'Hand-painted look', 
    promptAddition: 'Transform into a hand-painted anime style reminiscent of Studio Ghibli, with lush environments, soft painterly textures, and whimsical lighting.',
    cssFilter: 'saturate(1.2) brightness(1.1) contrast(0.9)'
  }
];

const VideoEditTool: React.FC = () => {
  const [sourceVideo, setSourceVideo] = useState<string | null>(null);
  const [sourceFrame, setSourceFrame] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Initializing Engine...');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  // High-performance Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [renderSpeed, setRenderSpeed] = useState<number>(1);
  
  const [targetResolution, setTargetResolution] = useState<'720p' | '1080p'>('720p');
  const [targetFormat, setTargetFormat] = useState<'MP4' | 'MOV'>('MP4');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Directly update video filter to avoid React re-render lag on large files
  useEffect(() => {
    if (videoRef.current) {
      const filter = FILTERS.find(f => f.id === selectedFilter);
      videoRef.current.style.filter = filter?.cssFilter || 'none';
    }
  }, [selectedFilter]);

  // Memory Management: Robust cleanup
  useEffect(() => {
    return () => {
      if (sourceVideo) {
        if (videoRef.current) {
          videoRef.current.src = '';
          videoRef.current.load();
        }
        URL.revokeObjectURL(sourceVideo);
      }
      if (resultVideo) URL.revokeObjectURL(resultVideo);
    };
  }, [sourceVideo, resultVideo]);

  const captureFrame = useCallback(() => {
    // Throttle frame capture to prevent UI lockup on high-res files
    if (captureTimeoutRef.current) return;
    
    captureTimeoutRef.current = setTimeout(() => {
      if (videoRef.current) {
        const video = videoRef.current;
        if (!frameCanvasRef.current) {
          frameCanvasRef.current = document.createElement('canvas');
        }
        const canvas = frameCanvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setSourceFrame(canvas.toDataURL('image/jpeg', 0.7)); // Faster than PNG
        }
      }
      captureTimeoutRef.current = null;
    }, 250); // 4fps capture limit during scrubbing
  }, []);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (sourceVideo) URL.revokeObjectURL(sourceVideo);
      const url = URL.createObjectURL(file);
      setSourceVideo(url);
      setResultVideo(null);
      setSourceFrame(null);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEdit = async () => {
    if (!sourceVideo || isProcessing) return;
    setIsProcessing(true);
    setProcessingStatus('Analyzing Motion Vectors...');

    try {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) await (window as any).aistudio.openSelectKey();
      }

      const activeFilter = FILTERS.find(f => f.id === selectedFilter) || FILTERS[0];
      
      // Build Temporal Instruction
      let speedInstruction = "";
      if (renderSpeed === 0.5) speedInstruction = " Render this output in smooth cinematic slow motion (half speed).";
      if (renderSpeed === 2.0) speedInstruction = " Render this output in fast motion (double speed).";

      const combinedPrompt = `${prompt} ${activeFilter.promptAddition} ${speedInstruction}`.trim();
      const finalPrompt = combinedPrompt || "Re-imagine this scene with high cinematic quality";
      const base64Frame = sourceFrame ? sourceFrame.split(',')[1] : undefined;
      
      const url = await GeminiService.generateVideo(
        finalPrompt,
        aspectRatio,
        base64Frame,
        targetResolution
      );
      setResultVideo(url);
    } catch (error: any) {
      console.error("Video transformation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio?.openSelectKey();
      } else {
        alert("Neural cluster capacity exceeded. Please retry in 60s.");
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('Initializing Engine...');
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent theme-transition">
      {isBroadcasting && resultVideo && (
        <BroadcastModal 
          mediaUrl={resultVideo} 
          type="video" 
          prompt={prompt || "Cinematic neural morph"} 
          onClose={() => setIsBroadcasting(false)} 
        />
      )}

      {/* Side Control Plane */}
      <div className="w-full lg:w-96 space-y-6 flex-shrink-0 flex flex-col overflow-y-auto pr-3 custom-scrollbar pb-10">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-600 uppercase tracking-[0.2em] mb-3 px-1">Source Asset</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition group relative overflow-hidden shadow-inner"
          >
            {sourceVideo ? (
              <div className="w-full h-full relative">
                <video 
                  ref={videoRef}
                  src={sourceVideo} 
                  className="w-full h-full object-cover transition-all duration-300 will-change-[filter,transform]" 
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onSeeked={captureFrame}
                  muted
                  playsInline
                  preload="auto"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-emerald-600 px-5 py-2.5 rounded-2xl shadow-lg border border-white/20">Swap Master</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <i className="fas fa-file-video text-3xl text-neutral-200 dark:text-neutral-800 group-hover:text-emerald-500/50 transition-colors"></i>
                <div className="space-y-1">
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">Import Studio Asset</p>
                  <p className="text-[8px] text-neutral-300 dark:text-neutral-700 uppercase tracking-tight">MP4, MOV Max 500MB</p>
                </div>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleVideoUpload} accept="video/*" />
        </div>

        {sourceVideo && (
          <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
             <div className="flex items-center justify-between">
                <button onClick={togglePlayback} className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transition transform active:scale-90">
                   <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
                </button>
                <div className="flex space-x-2">
                   {[0.5, 1, 1.5, 2].map(rate => (
                     <button 
                       key={rate} 
                       onClick={() => { setPlaybackRate(rate); if(videoRef.current) videoRef.current.playbackRate = rate; }}
                       className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${playbackRate === rate ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-neutral-400'}`}
                     >
                        {rate}x
                     </button>
                   ))}
                </div>
             </div>
             <div className="space-y-1">
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 0} 
                  step="0.01" 
                  value={currentTime} 
                  onChange={handleScrub}
                  className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[8px] font-black text-neutral-400 uppercase tabular-nums">
                   <span>{currentTime.toFixed(2)}s</span>
                   <span>{duration.toFixed(2)}s</span>
                </div>
             </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-600 uppercase tracking-[0.2em]">Visual Profile</label>
            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">{selectedFilter !== 'none' && FILTERS.find(f => f.id === selectedFilter)?.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 group ${
                  selectedFilter === filter.id
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/20'
                    : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 hover:border-emerald-500/30'
                }`}
                title={filter.description}
              >
                <i className={`fas ${filter.icon} text-xs mb-1.5`}></i>
                <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{filter.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-600 uppercase tracking-[0.2em] px-1">Morph Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe stylistic shifts or temporal extensions..."
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 h-28 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none text-[12px] text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-800 shadow-inner transition-all font-medium leading-relaxed"
          />
        </div>

        <div className="bg-neutral-100/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 space-y-6">
          <label className="block text-[10px] font-black text-neutral-500 dark:text-neutral-600 uppercase tracking-[0.2em] px-1">Mastering Parameters</label>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-600 px-1">
               <span>Target Resolution</span>
               <span className={targetResolution === '1080p' ? 'text-emerald-500 animate-pulse' : ''}>
                 {targetResolution === '1080p' ? 'Elite Fidelity' : 'Standard'}
               </span>
             </div>
             <div className="flex bg-white dark:bg-black p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
               <button onClick={() => setTargetResolution('720p')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetResolution === '720p' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-md' : 'text-neutral-400 hover:text-neutral-600'}`}>720p</button>
               <button onClick={() => setTargetResolution('1080p')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetResolution === '1080p' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-400 hover:text-neutral-600'}`}>1080p</button>
             </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-600 px-1">
               <span>Render Speed</span>
               <span className="text-emerald-500">{renderSpeed}x</span>
             </div>
            <div className="flex bg-white dark:bg-black p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
              <button onClick={() => setRenderSpeed(0.5)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${renderSpeed === 0.5 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>0.5x</button>
              <button onClick={() => setRenderSpeed(1.0)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${renderSpeed === 1.0 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>1.0x</button>
              <button onClick={() => setRenderSpeed(2.0)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${renderSpeed === 2.0 ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>2.0x</button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[9px] font-black uppercase text-neutral-400 dark:text-neutral-600 px-1">
               <span>Aspect Proportions</span>
               <span className="text-emerald-500">{aspectRatio}</span>
             </div>
            <div className="flex bg-white dark:bg-black p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-inner">
              <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>16:9</button>
              <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>9:16</button>
            </div>
          </div>
        </div>

        <button
          onClick={handleEdit}
          disabled={isProcessing || !sourceVideo}
          className="w-full py-6 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center space-x-4 group relative overflow-hidden"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>{processingStatus}</span>
            </>
          ) : (
            <>
              <i className="fas fa-compact-disc transition-transform group-hover:rotate-90 duration-500"></i>
              <span>Initiate Render</span>
            </>
          )}
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-white/40 w-full animate-pulse"></div>}
        </button>

        {sourceVideo && (
          <button 
            onClick={() => { setSourceVideo(null); setResultVideo(null); setPrompt(''); setSelectedFilter('none'); setSourceFrame(null); }}
            className="text-neutral-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition text-center w-full"
          >
            Purge Workspace
          </button>
        )}
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 bg-white dark:bg-[#080808] rounded-[3rem] border border-neutral-200 dark:border-neutral-900 flex flex-col overflow-hidden relative shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] theme-transition">
        <div className="absolute top-8 left-10 z-10">
           <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl border border-neutral-200 dark:border-white/5 text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] shadow-sm">
             Hobbs Studio Intelligence Layer
           </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
          {isProcessing ? (
            <div className="text-center space-y-12 max-w-sm animate-fade-in">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-[8px] border-emerald-600/10 rounded-full"></div>
                <div className="absolute inset-0 border-[8px] border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-6 border-[3px] border-teal-500/20 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
              </div>
              <div className="space-y-5">
                <h4 className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm italic">{processingStatus}</h4>
                <p className="text-neutral-400 dark:text-neutral-600 text-[9px] uppercase font-bold leading-relaxed px-10 italic">Neural clusters are synthesizing frame-by-frame stylistic migration at {targetResolution}.</p>
              </div>
            </div>
          ) : resultVideo ? (
            <div className="relative group h-full w-full flex items-center justify-center animate-fade-in">
              <video src={resultVideo} controls autoPlay loop className="max-h-full max-w-full rounded-[2.5rem] shadow-2xl object-contain border border-neutral-200 dark:border-white/5" />
              
              <div className="absolute bottom-10 right-10 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button onClick={() => setIsBroadcasting(true)} className="p-5 bg-emerald-600 text-white rounded-2xl hover:scale-110 active:scale-95 transition shadow-2xl shadow-emerald-900/40 border border-white/20">
                  <i className="fas fa-tower-broadcast text-xl"></i>
                </button>
                <button onClick={() => { if(resultVideo) { const l = document.createElement('a'); l.href = resultVideo; l.download = `master-${Date.now()}.${targetFormat.toLowerCase()}`; l.click(); }}} className="p-5 bg-white dark:bg-black text-neutral-900 dark:text-white rounded-2xl hover:scale-110 active:scale-95 transition shadow-2xl border border-neutral-200 dark:border-neutral-800">
                  <i className="fas fa-download text-xl"></i>
                </button>
              </div>
            </div>
          ) : sourceVideo ? (
            <div className="text-center space-y-8 flex flex-col items-center animate-fade-in">
              <div className="relative group overflow-hidden rounded-[3rem] border border-neutral-200 dark:border-neutral-900 max-h-[480px] shadow-2xl">
                 {/* Visual Proxy */}
                 <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                    <i className="fas fa-video text-6xl text-neutral-200 dark:text-neutral-800 opacity-20"></i>
                 </div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center space-y-5">
                   <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
                      <i className="fas fa-wand-sparkles text-neutral-200 text-3xl opacity-20"></i>
                   </div>
                   <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Workspace Prepped</p>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-900 dark:text-neutral-200 max-w-sm space-y-10 animate-fade-in">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-[1px] border-neutral-200 dark:border-neutral-900 flex items-center justify-center mx-auto bg-neutral-100/50 dark:bg-neutral-950/30 shadow-inner group transition-transform hover:scale-110 duration-1000">
                  <i className="fas fa-video-slash text-6xl text-neutral-200 dark:text-neutral-900"></i>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.2em] text-lg italic">Motion Morph Intelligence</h4>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-600 leading-relaxed font-medium italic px-4">Import a high-fidelity cinematic asset to initiate neural style migration and mastering.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditTool;
