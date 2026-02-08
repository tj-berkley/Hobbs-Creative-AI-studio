
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

const ImageEditTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
        setActivePreset(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (customPrompt?: string, presetId?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!originalImage || !finalPrompt.trim() || isProcessing) return;

    setIsProcessing(true);
    if (presetId) setActivePreset(presetId);
    
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await GeminiService.editImage(base64Data, finalPrompt);
      setEditedImage(result);
    } catch (error) {
      console.error("Magic Edit failed:", error);
      alert("Failed to process image. The neural engine may be at capacity or the image is too complex.");
    } finally {
      setIsProcessing(false);
      setActivePreset(null);
    }
  };

  const handleRemoveBackground = () => {
    const bgRemovalPrompt = "Perform a clean, professional background removal. Isolate the primary subject with sharp edges and place it on a solid, pure white background. Remove all shadows and distractions from the background.";
    handleEdit(bgRemovalPrompt, 'bg-removal');
  };

  const handleStudioLight = () => {
    const lightPrompt = "Apply professional studio lighting to this subject. Enhance details with cinematic rim lighting, soft fill light, and a high-end commercial aesthetic. Make the lighting look intentional and premium.";
    handleEdit(lightPrompt, 'studio-light');
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `hobbs-magic-edit-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent theme-transition">
      {/* Controls Panel */}
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 flex flex-col overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Studio Source Asset</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:border-pink-500/50 transition group relative overflow-hidden shadow-inner"
          >
            {originalImage ? (
              <>
                <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-pink-600 px-4 py-2 rounded-xl shadow-lg">Swap Master</span>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mx-auto border border-neutral-100 dark:border-neutral-700 group-hover:scale-110 transition-transform duration-500">
                  <i className="fas fa-cloud-arrow-up text-xl text-neutral-300 dark:text-neutral-600 group-hover:text-pink-500"></i>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">Import Asset</p>
                  <p className="text-[8px] text-neutral-300 dark:text-neutral-700 uppercase tracking-tighter">High-Fidelity PNG/JPG</p>
                </div>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Neural Directives</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the desired transformation... e.g., 'Replace his tie with a bowtie', 'Add snow to the background'"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 pr-12 h-32 focus:outline-none focus:ring-4 focus:ring-pink-600/10 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium leading-relaxed"
            />
            <button
              onClick={() => handleEdit()}
              disabled={isProcessing || !originalImage || !prompt.trim()}
              className="absolute bottom-4 right-4 w-10 h-10 bg-pink-600 text-white rounded-xl flex items-center justify-center hover:bg-pink-500 disabled:opacity-30 transition-all shadow-lg active:scale-90"
              title="Apply Custom Edit"
            >
              <i className={`fas ${isProcessing && !activePreset ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em]">Neural Presets</label>
            <div className="h-px flex-1 bg-neutral-100 dark:bg-neutral-800"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleRemoveBackground}
              disabled={isProcessing || !originalImage}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                activePreset === 'bg-removal'
                  ? 'bg-pink-600 border-pink-400 text-white shadow-xl'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-pink-500/50'
              }`}
            >
              <div className="flex flex-col space-y-2 relative z-10">
                <i className={`fas fa-eraser text-xs ${activePreset === 'bg-removal' ? 'text-white' : 'text-pink-600'}`}></i>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-tight">Remove BG</p>
                  <p className={`text-[8px] font-bold uppercase opacity-50 ${activePreset === 'bg-removal' ? 'text-white' : ''}`}>AI Subject Isolation</p>
                </div>
              </div>
              {activePreset === 'bg-removal' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30 animate-[progress_10s_linear_forwards] w-0"></div>
              )}
            </button>

            <button
              onClick={handleStudioLight}
              disabled={isProcessing || !originalImage}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                activePreset === 'studio-light'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
              }`}
            >
              <div className="flex flex-col space-y-2 relative z-10">
                <i className={`fas fa-lightbulb text-xs ${activePreset === 'studio-light' ? 'text-white' : 'text-indigo-600'}`}></i>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-tight">Studio Master</p>
                  <p className={`text-[8px] font-bold uppercase opacity-50 ${activePreset === 'studio-light' ? 'text-white' : ''}`}>High-End Lighting</p>
                </div>
              </div>
              {activePreset === 'studio-light' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30 animate-[progress_10s_linear_forwards] w-0"></div>
              )}
            </button>
          </div>
        </div>

        {originalImage && (
          <button 
            onClick={() => { setOriginalImage(null); setEditedImage(null); setPrompt(''); setActivePreset(null); }}
            className="w-full text-neutral-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition text-center pt-4"
          >
            Clear Session Master
          </button>
        )}
      </div>

      {/* Result Panel */}
      <div className="flex-1 bg-white/50 dark:bg-neutral-900/10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden relative shadow-sm dark:shadow-2xl theme-transition">
        <div className="absolute top-8 left-8 z-20 flex items-center space-x-3">
           <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] shadow-sm">
             Intelligence Output
           </div>
           {isProcessing && (
             <div className="bg-pink-600/10 text-pink-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse border border-pink-600/20">
               {activePreset === 'bg-removal' ? 'Isolating Subject...' : activePreset === 'studio-light' ? 'Applying Lighting...' : 'Processing Directives...'}
             </div>
           )}
        </div>

        <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
          {isProcessing ? (
            <div className="text-center space-y-10 animate-fade-in">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 border-[6px] border-pink-600/10 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-[2px] border-pink-600/20 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-microchip text-pink-600/40 text-2xl"></i>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.3em] text-sm italic">Gemini Core 2.5 Active</p>
                <p className="text-neutral-400 dark:text-neutral-700 text-[10px] uppercase font-bold tracking-tighter leading-relaxed">
                  Analyzing visual nodes & establishing new stylistic baseline.<br />
                  Estimated temporal delay: 8-12 seconds.
                </p>
              </div>
            </div>
          ) : editedImage ? (
            <div className="relative group max-h-full w-full flex items-center justify-center animate-fade-in">
              <img src={editedImage} alt="Edited Result" className="max-h-full max-w-full rounded-[2rem] shadow-2xl object-contain transition-transform duration-700 group-hover:scale-[1.01] border border-neutral-200 dark:border-neutral-800" />
              <div className="absolute bottom-8 right-8 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => downloadImage(editedImage)}
                  className="p-5 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl rounded-2xl text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  title="Export Studio Track"
                >
                  <i className="fas fa-download text-lg"></i>
                </button>
              </div>
              <div className="absolute top-8 right-8 bg-pink-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-900/20">
                Neural Render Success
              </div>
            </div>
          ) : originalImage ? (
            <div className="text-center space-y-8 flex flex-col items-center max-w-lg">
              <div className="relative group cursor-default">
                <div className="absolute -inset-4 bg-pink-600/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative w-64 h-64 grayscale opacity-30 group-hover:opacity-60 transition-all duration-1000 transform hover:scale-[1.02]">
                   <img src={originalImage} className="w-full h-full object-contain rounded-[2rem]" alt="Original Reference" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[0.3em] italic">Workspace Ready</p>
                <p className="text-neutral-300 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                  Input a custom directive above or select a neural preset<br />
                  to initiate a high-fidelity stylistic transformation.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 animate-fade-in max-w-xs">
              <div className="w-32 h-32 rounded-[3rem] bg-neutral-100 dark:bg-neutral-900/50 flex items-center justify-center mx-auto transition-all hover:rotate-6 border border-neutral-200 dark:border-neutral-800 shadow-inner group">
                 <i className="fas fa-wand-sparkles text-5xl text-neutral-300 dark:text-neutral-800 group-hover:text-pink-600/40 transition-colors"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-neutral-500 dark:text-neutral-700 text-[11px] font-black uppercase tracking-[0.4em] italic">Master Edit Sync</h4>
                <p className="text-neutral-400 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                  Import an asset to enable Magic Editing.<br />
                  Gemini 2.5 Flash is tuned for precision manipulation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ImageEditTool;
