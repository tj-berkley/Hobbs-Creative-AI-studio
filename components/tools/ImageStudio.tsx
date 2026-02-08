
import React, { useState } from 'react';
import { GeminiService } from '../../services/geminiService';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const ratios = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9'];
  const sizes = ['1K', '2K', '4K'];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResult(null);

    try {
      // Check for Gemini 3 Pro API key selection first
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const imageUrl = await GeminiService.generateImage(prompt, { aspectRatio, imageSize });
      setResult(imageUrl);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found") && typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
      }
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Artistic Directive</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A vibrant cyberpunk market in Neo-Tokyo, 8k resolution, cinematic lighting..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 h-40 focus:outline-none focus:ring-2 focus:ring-purple-600/50 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium"
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

        {result && (
          <button 
            onClick={() => { setPrompt(''); setResult(null); }}
            className="w-full text-neutral-400 dark:text-neutral-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition text-center"
          >
            Clear Session
          </button>
        )}
      </div>

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
            <img src={result} alt="Generated" className="h-full w-full object-contain rounded-2xl shadow-2xl transition-all duration-700 group-hover:scale-[1.01]" />
            <div className="absolute bottom-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = `hobbs-gen-${Date.now()}.png`;
                  link.click();
                }}
                className="p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl text-neutral-900 dark:text-white border border-white/20 hover:scale-110 active:scale-95 transition shadow-2xl"
              >
                <i className="fas fa-download"></i>
              </button>
            </div>
            <div className="absolute top-6 left-6 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Render Success
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto transition-transform hover:rotate-12 duration-700">
               <i className="fas fa-magic text-4xl text-neutral-300 dark:text-neutral-800"></i>
            </div>
            <div className="space-y-2">
              <p className="text-neutral-500 dark:text-neutral-700 text-[10px] font-black uppercase tracking-[0.3em] italic">Workspace Standby</p>
              <p className="text-neutral-400 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-tighter">Enter a prompt to initiate visual intelligence</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
