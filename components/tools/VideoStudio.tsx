
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setVideoUrl(null);

    try {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) await (window as any).aistudio.openSelectKey();
      }

      // Convert source image if present
      let base64 = sourceImage ? sourceImage.split(',')[1] : undefined;
      const url = await GeminiService.generateVideo(prompt || "Cinematic video animation", aspectRatio, base64);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio?.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Animation Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A neon hologram of a cat driving at top speed through a rain-slicked city..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-orange-600/50 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Motion Pivot (Optional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition group relative overflow-hidden shadow-sm"
          >
            {sourceImage ? (
              <>
                <img src={sourceImage} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-orange-600 px-4 py-2 rounded-xl">Replace Frame</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <i className="fas fa-image text-2xl text-neutral-200 dark:text-neutral-800 mb-2 group-hover:text-orange-500 transition-colors"></i>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-widest">Import Starting Node</p>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
          {sourceImage && (
            <button onClick={() => setSourceImage(null)} className="mt-3 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition ml-1">Purge Asset</button>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Cinematic Ratio</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`p-5 rounded-2xl text-center border transition-all duration-300 ${
                aspectRatio === '16:9' 
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-orange-500/50'
              }`}
            >
              <i className="fas fa-desktop mb-2 text-sm"></i>
              <div className="text-[10px] font-black uppercase tracking-widest">Landscape</div>
              <div className="text-[8px] opacity-60 font-bold">16:9</div>
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`p-5 rounded-2xl text-center border transition-all duration-300 ${
                aspectRatio === '9:16' 
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-orange-500/50'
              }`}
            >
              <i className="fas fa-mobile-screen mb-2 text-sm"></i>
              <div className="text-[10px] font-black uppercase tracking-widest">Portrait</div>
              <div className="text-[8px] opacity-60 font-bold">9:16</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-orange-900/20 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 transition-all transform active:scale-95 flex items-center justify-center space-x-3 group"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Generating Motion...</span>
            </>
          ) : (
            <>
              <i className="fas fa-clapperboard transition-transform group-hover:scale-125"></i>
              <span>Render Cinematic</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-900 flex flex-col items-center justify-center p-8 relative shadow-sm dark:shadow-2xl overflow-hidden theme-transition">
        {isGenerating ? (
          <div className="text-center space-y-8 max-w-sm animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-[6px] border-orange-600/10 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-orange-500/20 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
            </div>
            <div className="space-y-3">
              <p className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm italic">Synthesizing Cinematic Scene</p>
              <p className="text-neutral-500 dark:text-neutral-500 text-[10px] uppercase font-bold leading-relaxed tracking-tighter">
                Veo 3.1 is analyzing your directives. <br />
                Estimated temporal processing: 120-180 seconds.
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        ) : videoUrl ? (
          <div className="h-full w-full flex flex-col group relative">
            <video src={videoUrl} controls autoPlay loop className="h-full w-full object-contain rounded-2xl shadow-2xl transition-all duration-700" />
            <div className="absolute bottom-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = videoUrl;
                  link.download = `hobbs-video-${Date.now()}.mp4`;
                  link.click();
                }}
                className="p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl text-neutral-900 dark:text-white border border-white/20 hover:scale-110 active:scale-95 transition shadow-2xl"
              >
                <i className="fas fa-download"></i>
              </button>
            </div>
            <div className="absolute top-6 left-6 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Motion Export Ready
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto transition-transform hover:-rotate-12 duration-700">
               <i className="fas fa-film text-4xl text-neutral-300 dark:text-neutral-800"></i>
            </div>
            <div className="space-y-2">
              <p className="text-neutral-500 dark:text-neutral-700 text-[10px] font-black uppercase tracking-[0.3em] italic">Cinema Engine Standby</p>
              <p className="text-neutral-400 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-tighter">Enter a directive and initiate motion render</p>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VideoStudio;
