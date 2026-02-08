
import React, { useState, useEffect, useMemo } from 'react';
import { GeminiService } from '../../services/geminiService';
import { ImageResult } from '../../types';
import BroadcastModal from '../BroadcastModal';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState<number | null>(null);

  const [history, setHistory] = useState<ImageResult[]>(() => {
    const saved = localStorage.getItem('hobbs-image-history');
    return saved ? JSON.parse(saved) : [];
  });

  const ratios = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9'];
  const sizes = ['1K', '2K', '4K'];

  useEffect(() => {
    localStorage.setItem('hobbs-image-history', JSON.stringify(history));
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    return history.filter(item => 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

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

  const copyPrompt = (text: string, timestamp: number) => {
    navigator.clipboard.writeText(text);
    setIsCopied(timestamp);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const deleteHistoryItem = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Excise this node from session memory?")) {
      setHistory(prev => prev.filter(item => item.timestamp !== timestamp));
      if (result?.timestamp === timestamp) setResult(null);
    }
  };

  const clearHistory = () => {
    if (confirm("Purge all historical records from this session?")) {
      setHistory([]);
      setResult(null);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent theme-transition">
      {isBroadcasting && result && (
        <BroadcastModal 
          mediaUrl={result.url} 
          type="image" 
          prompt={result.prompt} 
          onClose={() => setIsBroadcasting(false)} 
        />
      )}
      
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
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-purple-500/50'
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
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-indigo-500/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced History Panel */}
          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-900/50 space-y-4 pb-4">
            <div className="flex justify-between items-center px-1">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest">Studio Archives</label>
                <p className="text-[8px] text-neutral-400 font-bold uppercase">{history.length} Nodes Registered</p>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-[8px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition"
                >
                  Purge All
                </button>
              )}
            </div>

            {history.length > 0 && (
              <div className="px-1">
                <div className="relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search session clusters..."
                    className="w-full bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl px-8 py-2 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-neutral-400"></i>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 px-1">
              {filteredHistory.map((item) => (
                <div
                  key={item.timestamp}
                  onClick={() => setResult(item)}
                  className={`group aspect-square rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer ${
                    result?.timestamp === item.timestamp 
                      ? 'border-purple-500 shadow-lg ring-2 ring-purple-500/20 z-10' 
                      : 'border-neutral-100 dark:border-neutral-800 hover:border-purple-500/40'
                  }`}
                  title={item.prompt}
                >
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="History Node" />
                  
                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                    <div className="flex space-x-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadImage(item.url, `archive-${item.timestamp}.png`); }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                        title="Quick Download"
                      >
                        <i className="fas fa-download text-[10px]"></i>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyPrompt(item.prompt, item.timestamp); }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                        title="Copy Prompt"
                      >
                        <i className={`fas ${isCopied === item.timestamp ? 'fa-check text-green-400' : 'fa-copy'} text-[10px]`}></i>
                      </button>
                    </div>
                    <button 
                      onClick={(e) => deleteHistoryItem(item.timestamp, e)}
                      className="text-[8px] font-black text-red-400 hover:text-red-300 uppercase tracking-tighter transition-colors"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Indicator for currently viewed */}
                  {result?.timestamp === item.timestamp && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full shadow-sm animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>

            {history.length > 0 && filteredHistory.length === 0 && (
              <p className="text-[9px] text-neutral-500 text-center italic py-4">No nodes match your filter directive.</p>
            )}
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
                onClick={() => setIsBroadcasting(true)}
                className="p-4 bg-emerald-600 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:scale-110 active:scale-95 transition shadow-2xl"
                title="Broadcast to Network"
              >
                <i className="fas fa-tower-broadcast"></i>
              </button>
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
            
            {/* Context Tooltip for large view */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-2xl max-w-lg">
               <p className="text-[10px] text-neutral-300 font-medium italic line-clamp-1">"{result.prompt}"</p>
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
    </div>
  );
};

export default ImageStudio;
