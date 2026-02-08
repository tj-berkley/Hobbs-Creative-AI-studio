
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';
import BroadcastModal from '../BroadcastModal';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [targetResolution, setTargetResolution] = useState<'720p' | '1080p'>('720p');
  const [targetFormat, setTargetFormat] = useState<'MP4' | 'MOV'>('MP4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
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

      let base64 = sourceImage ? sourceImage.split(',')[1] : undefined;
      const url = await GeminiService.generateVideo(
        prompt || "Cinematic video animation", 
        aspectRatio, 
        base64,
        targetResolution
      );
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

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    const ext = targetFormat.toLowerCase();
    link.download = `hobbs-studio-cinema-${Date.now()}.${ext}`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      {isBroadcasting && videoUrl && (
        <BroadcastModal 
          mediaUrl={videoUrl} 
          type="video" 
          prompt={prompt || "Cinematic studio render"} 
          onClose={() => setIsBroadcasting(false)} 
        />
      )}

      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Animation Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A neon hologram of a cat driving at top speed through a rain-slicked city..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Motion Pivot (Optional)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition group relative overflow-hidden shadow-sm"
          >
            {sourceImage ? (
              <>
                <img src={sourceImage} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-emerald-600 px-4 py-2 rounded-xl">Replace Frame</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <i className="fas fa-image text-2xl text-neutral-200 dark:text-neutral-800 mb-2 group-hover:text-emerald-500 transition-colors"></i>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-widest">Import Starting Node</p>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
        </div>

        <div className="space-y-6 pt-4 border-t border-neutral-800/50">
          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Render Resolution</label>
            </div>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <button onClick={() => setTargetResolution('720p')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetResolution === '720p' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-400'}`}>720p</button>
              <button onClick={() => setTargetResolution('1080p')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetResolution === '1080p' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-400'}`}>1080p</button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Export Format</label>
            </div>
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <button onClick={() => setTargetFormat('MP4')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetFormat === 'MP4' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-400'}`}>MP4</button>
              <button onClick={() => setTargetFormat('MOV')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${targetFormat === 'MOV' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-400'}`}>MOV</button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-5 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all transform active:scale-95 flex items-center justify-center space-x-3 group"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Neural Processing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-film transition-transform group-hover:scale-125"></i>
              <span>Render Cinematic</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-900 flex flex-col items-center justify-center p-8 relative shadow-sm dark:shadow-2xl overflow-hidden theme-transition">
        {isGenerating ? (
          <div className="text-center space-y-8 max-w-sm animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-[6px] border-emerald-600/10 rounded-full"></div>
              <div className="absolute inset-0 border-[6px] border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm italic">Synthesizing Motion</p>
          </div>
        ) : videoUrl ? (
          <div className="h-full w-full flex flex-col group relative">
            <video src={videoUrl} controls autoPlay loop className="h-full w-full object-contain rounded-2xl shadow-2xl transition-all duration-700" />
            
            <div className="absolute bottom-6 right-6 flex items-center bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsBroadcasting(true)}
                  className="p-4 bg-emerald-600 text-white rounded-xl hover:scale-110 transition shadow-lg"
                  title="Broadcast to Network"
                >
                  <i className="fas fa-tower-broadcast"></i>
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-4 bg-white text-black rounded-xl hover:bg-emerald-400 transition transform active:scale-95 shadow-lg"
                  title={`Export as ${targetFormat}`}
                >
                  <i className="fas fa-download text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 text-neutral-300 dark:text-neutral-800">
             <i className="fas fa-film text-6xl"></i>
             <p className="text-[10px] font-black uppercase tracking-widest italic">Cinema Engine Standby</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStudio;
