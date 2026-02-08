
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../../services/geminiService';
import { ImageResult } from '../../types';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [history, setHistory] = useState<ImageResult[]>(() => {
    const saved = localStorage.getItem('hobbs-image-history');
    return saved ? JSON.parse(saved) : [];
  });

  const ratios = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9'];
  const sizes = ['1K', '2K', '4K'];

  useEffect(() => {
    localStorage.setItem('hobbs-image-history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    // Note: Not clearing result immediately so the old one stays while generating if desired, 
    // but the UI currently shows a loader in its place.

    try {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const imageUrl = await GeminiService.generateImage(prompt, { aspectRatio, imageSize });
      
      const newResult: ImageResult = {
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now()
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev]);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found") && typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const clearHistory = () => {
    if (confirm("Purge all historical records from this session?")) {
      setHistory([]);
      setResult(null);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      {/* Controls & History Sidebar */}
      <div className="w-full lg:w-96 flex flex-col space-y-8 flex-shrink-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Artistic Directive</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A vibrant cyberpunk market in Neo-Tokyo, 8k resolution, cinematic lighting..."
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-purple-600/50 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Canvas Proportions</label>
            <div className="grid grid-cols-4 gap-2">
              {ratios.map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all duration-300 ${
                    aspectRatio === r 
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-purple-500/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Target Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setImageSize(s)}
                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all duration-300 ${
                    imageSize === s 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-indigo-500/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* History Panel Integration */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900/50 space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Studio Archives</label>
                <button 
                  onClick={clearHistory}
                  className="text-[8px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition"
                >
                  Purge All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-4">
                {history.map((item, idx) => (
                  <button
                    key={item.timestamp}
                    onClick={() => setResult(item)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all group relative ${
                      result?.timestamp === item.timestamp 
                        ? 'border-purple-500 shadow-md ring-2 ring-purple-500/20' 
                        : 'border-neutral-100 dark:border-neutral-800 hover:border-purple-500/50'
                    }`}
                  >
                    <img src={item.url} className="w-full h-full object-cover" alt={`History ${idx}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <i className="fas fa-eye text-white text-[10px]"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-purple-900/20 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-sparkles fa-spin"></i>
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-image"></i>
              <span>Generate Masterpiece</span>
            </>
          )}
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-900 flex items-center justify-center p-6 relative overflow-hidden shadow-sm dark:shadow-2xl theme-transition">
        {isGenerating ? (
          <div className="text-center space-y-8 animate-pulse">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-600/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <p className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-sm italic">Gemini 3 Pro Active</p>
              <p className="text-neutral-400 dark:text-neutral-600 text-[10px] uppercase font-bold tracking-tighter">Crafting high-fidelity visual nodes...</p>
            </div>
          </div>
        ) : result ? (
          <div className="h-full w-full flex flex-col group relative">
            <img src={result.url} alt="Generated Result" className="h-full w-full object-contain rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-[1.01]" />
            
            <div className="absolute bottom-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={() => downloadImage(result.url, `hobbs-gen-${result.timestamp}.png`)}
                className="p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl text-neutral-900 dark:text-white border border-white/20 hover:scale-110 active:scale-95 transition shadow-2xl"
                title="Download Masterpiece"
              >
                <i className="fas fa-download"></i>
              </button>
            </div>

            <div className="absolute top-6 left-6 flex flex-col space-y-2">
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest shadow-sm">
                Render Success
              </div>
              <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-[9px] font-bold text-neutral-500 dark:text-neutral-400 max-w-xs shadow-sm line-clamp-2">
                "{result.prompt}"
              </div>
            </div>

            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setResult(null)}
                className="w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-full text-neutral-400 hover:text-red-500 border border-white/20 flex items-center justify-center transition shadow-sm"
                title="Close Preview"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto transition-transform hover:rotate-12 duration-700">
               <i className="fas fa-magic text-4xl text-neutral-300 dark:text-neutral-800"></i>
            </div>
            <div className="space-y-2">
              <p className="text-neutral-500 dark:text-neutral-700 text-[10px] font-black uppercase tracking-[0.3em] italic">Workspace Standby</p>
              <p className="text-neutral-400 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-tighter">Enter a prompt or select from archives to initiate visual intelligence</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
