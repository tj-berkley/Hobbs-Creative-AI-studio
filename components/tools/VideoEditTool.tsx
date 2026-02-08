
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../../services/geminiService';

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
    id: 'vibrant', 
    name: 'Vibrant', 
    icon: 'fa-sun', 
    description: 'Punchy and saturated', 
    promptAddition: 'Enhance with vibrant colors, high saturation, and crisp details for a lively and energetic look.',
    cssFilter: 'saturate(1.8) contrast(1.1)'
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
    id: 'vhs', 
    name: '90s VHS', 
    icon: 'fa-tape', 
    description: 'Retro camcorder', 
    promptAddition: 'Apply a 1990s VHS camcorder effect: low resolution, color bleeding, tracking lines, and slight digital jitter.',
    cssFilter: 'contrast(0.8) brightness(1.1) saturate(1.3) blur(0.5px)'
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
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeFilter = FILTERS.find(f => f.id === selectedFilter) || FILTERS[0];

  const captureFrame = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSourceFrame(dataUrl);
      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Please upload a smaller video (under 20MB) for processing.");
        return;
      }
      const url = URL.createObjectURL(file);
      setSourceVideo(url);
      setResultVideo(null);
      setSourceFrame(null);
      
      // Auto-capture frame after short delay once metadata loads
      setTimeout(() => {
        captureFrame();
      }, 1000);
    }
  };

  const handleEdit = async () => {
    if (!sourceVideo || isProcessing) return;

    setIsProcessing(true);
    try {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) await (window as any).aistudio.openSelectKey();
      }

      const combinedPrompt = `${prompt} ${activeFilter.promptAddition}`.trim();
      const finalPrompt = combinedPrompt || "Re-imagine this scene with high cinematic quality";

      // Pass the extracted first frame as the starting point for Veo
      const base64Frame = sourceFrame ? sourceFrame.split(',')[1] : undefined;
      
      const url = await GeminiService.generateVideo(
        finalPrompt,
        aspectRatio,
        base64Frame
      );
      setResultVideo(url);
    } catch (error: any) {
      console.error("Video transformation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio?.openSelectKey();
      } else {
        alert("Failed to process video. The neural engine might be at capacity.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden">
      {/* Controls Panel */}
      <div className="w-full lg:w-96 space-y-6 flex-shrink-0 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 px-1">Studio Source</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-rose-500/50 transition group relative overflow-hidden shadow-inner"
          >
            {sourceVideo ? (
              <>
                <video 
                  ref={videoRef}
                  src={sourceVideo} 
                  className="w-full h-full object-cover transition-all duration-500" 
                  style={{ filter: activeFilter.cssFilter }}
                  onLoadedMetadata={captureFrame}
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-rose-600 px-4 py-2 rounded-xl">Replace Asset</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <i className="fas fa-file-video text-3xl text-neutral-800 mb-3 group-hover:text-rose-500/50 transition-colors"></i>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Import Reference Video</p>
                <p className="text-[9px] text-neutral-700 mt-2 uppercase tracking-tight">MP4, MOV up to 20MB</p>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleVideoUpload} accept="video/*" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Visual Profile</label>
            <span className="text-[9px] text-rose-500 font-bold uppercase">{selectedFilter !== 'none' && activeFilter.name}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 group aspect-square ${
                  selectedFilter === filter.id
                    ? 'bg-rose-600 border-rose-400 text-white shadow-lg scale-105 z-10'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
                }`}
                title={filter.description}
              >
                <i className={`fas ${filter.icon} text-xs mb-1`}></i>
                <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{filter.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3 px-1">Creative Direction</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe stylistic shifts, additions, or transformations..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 h-24 focus:outline-none focus:ring-2 focus:ring-rose-600/50 resize-none text-[11px] text-neutral-200 placeholder:text-neutral-700 shadow-inner transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Export Config</label>
          <div className="flex bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                aspectRatio === '16:9' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              Landscape
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                aspectRatio === '9:16' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400'
              }`}
            >
              Portrait
            </button>
          </div>
        </div>

        <button
          onClick={handleEdit}
          disabled={isProcessing || !sourceVideo}
          className="w-full py-5 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-rose-900/20 hover:from-rose-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center space-x-3 group relative overflow-hidden"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Processing Neural Frames...</span>
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles transition-transform group-hover:scale-125"></i>
              <span>Re-imagine Master</span>
            </>
          )}
          {isProcessing && <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-[progress_240s_linear_forwards] w-0"></div>}
        </button>

        {sourceVideo && (
          <button 
            onClick={() => { setSourceVideo(null); setResultVideo(null); setPrompt(''); setSelectedFilter('none'); setSourceFrame(null); }}
            className="text-neutral-600 hover:text-neutral-400 text-[10px] font-black uppercase tracking-widest transition text-center w-full"
          >
            Reset Workspace
          </button>
        )}
      </div>

      {/* Result Panel */}
      <div className="flex-1 bg-neutral-900/20 rounded-[2.5rem] border border-neutral-800/60 flex flex-col overflow-hidden relative shadow-2xl">
        <div className="absolute top-6 left-8 z-10">
           <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
             Neural Transformation
           </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          {isProcessing ? (
            <div className="text-center space-y-10 max-w-sm">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 border-[6px] border-rose-600/10 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-[2px] border-pink-500/20 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-microchip text-rose-500/40 text-2xl"></i>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-black uppercase tracking-[0.2em] text-sm">Veo 3.1 Fast Render</h4>
                <p className="text-neutral-500 text-xs leading-relaxed italic px-4">Synthesizing high-fidelity cinematic motion from your source reference. Estimated time: 120-180 seconds.</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-600/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          ) : resultVideo ? (
            <div className="relative group h-full w-full flex items-center justify-center">
              <video src={resultVideo} controls autoPlay loop className="max-h-full max-w-full rounded-[2rem] shadow-2xl object-contain border border-neutral-800" />
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resultVideo;
                  link.download = `hobbs-studio-${Date.now()}.mp4`;
                  link.click();
                }}
                className="absolute bottom-6 right-6 p-5 bg-rose-600 text-white rounded-full hover:bg-rose-500 transition shadow-2xl transform hover:scale-110 active:scale-90"
                title="Download Master Track"
              >
                <i className="fas fa-download text-lg"></i>
              </button>
            </div>
          ) : sourceVideo ? (
            <div className="text-center space-y-6 flex flex-col items-center">
              <div className="relative group overflow-hidden rounded-[2.5rem] border border-neutral-800 max-h-[440px] shadow-2xl">
                <video 
                  src={sourceVideo} 
                  className="h-full w-full object-cover transition-all duration-1000 grayscale opacity-20" 
                  style={{ filter: `${activeFilter.cssFilter} grayscale(0.8) opacity(0.2)` }}
                  muted 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                      <i className="fas fa-wand-sparkles text-neutral-600 text-2xl"></i>
                   </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em]">Ready for Inference</p>
                <p className="text-neutral-800 text-[9px] uppercase font-bold">Configure your profile and initiate render</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-neutral-900 max-w-xs space-y-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-[10px] border-neutral-900 flex items-center justify-center mx-auto">
                  <i className="fas fa-video-slash text-5xl opacity-[0.03]"></i>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-neutral-900 border border-black rounded-full flex items-center justify-center">
                  <i className="fas fa-plus text-[10px] opacity-10"></i>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-neutral-700 font-black uppercase tracking-[0.2em] text-sm italic">Motion Intelligence Studio</h4>
                <p className="text-[11px] text-neutral-800 leading-relaxed font-medium">Import a cinematic asset and select a neural profile to initiate frame-by-frame style migration.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default VideoEditTool;
