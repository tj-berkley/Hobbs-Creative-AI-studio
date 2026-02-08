
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

const ImageEditTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await GeminiService.editImage(base64Data, prompt);
      setEditedImage(result);
    } catch (error) {
      console.error("Magic Edit failed:", error);
      alert("Failed to edit image. Please try a different prompt or image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!originalImage || isProcessing || isRemovingBackground) return;

    setIsRemovingBackground(true);
    setIsProcessing(true);
    try {
      const base64Data = originalImage.split(',')[1];
      const bgRemovalPrompt = "Carefully remove the entire background of this image. Isolate the main subject and place it on a perfectly clean, solid white background. Ensure the subject's edges are sharp and clean.";
      const result = await GeminiService.editImage(base64Data, bgRemovalPrompt);
      setEditedImage(result);
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Failed to remove background. Please try again with a clearer subject.");
    } finally {
      setIsRemovingBackground(false);
      setIsProcessing(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `hobbs-edit-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      {/* Controls Panel */}
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 px-1">Source Asset</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] flex items-center justify-center cursor-pointer hover:border-pink-500/50 transition group relative overflow-hidden shadow-inner"
          >
            {originalImage ? (
              <>
                <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest bg-pink-600 px-4 py-2 rounded-xl shadow-lg">Change Asset</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <i className="fas fa-cloud-arrow-up text-3xl text-neutral-200 dark:text-neutral-800 mb-3 group-hover:text-pink-500 transition-colors"></i>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-widest">Import Studio File</p>
                <p className="text-[8px] text-neutral-300 dark:text-neutral-700 mt-2 uppercase tracking-tight">Maximum Precision Render</p>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
        </div>

        <div className="space-y-4">
          <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Neural Directives</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the transformation... e.g., 'Change her jacket to red leather'"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-pink-600/50 resize-none text-[13px] text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 shadow-inner transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleEdit}
            disabled={isProcessing || !originalImage || !prompt.trim()}
            className="w-full py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-pink-900/20 hover:from-pink-500 hover:to-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
            {isProcessing && !isRemovingBackground ? (
              <>
                <i className="fas fa-wand-sparkles fa-spin"></i>
                <span>Applying Edit...</span>
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                <span>Establish Edit</span>
              </>
            )}
          </button>

          <div className="relative">
             <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-100 dark:bg-neutral-800 -z-10"></div>
             <span className="bg-neutral-50 dark:bg-[#0a0a0a] px-3 mx-auto text-[8px] font-black text-neutral-400 uppercase tracking-[0.3em] block w-max">Smart Actions</span>
          </div>

          <button
            onClick={handleRemoveBackground}
            disabled={isProcessing || !originalImage}
            className="w-full py-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all transform active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-30"
          >
            {isRemovingBackground ? (
              <>
                <i className="fas fa-circle-notch fa-spin text-indigo-500"></i>
                <span>Removing BG...</span>
              </>
            ) : (
              <>
                <i className="fas fa-scissors text-indigo-500"></i>
                <span>Remove Background</span>
              </>
            )}
          </button>
        </div>

        {originalImage && (
          <button 
            onClick={() => { setOriginalImage(null); setEditedImage(null); setPrompt(''); }}
            className="w-full text-neutral-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition text-center"
          >
            Purge Session
          </button>
        )}
      </div>

      {/* Result Panel */}
      <div className="flex-1 bg-white dark:bg-neutral-950 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-900 flex flex-col overflow-hidden relative shadow-sm dark:shadow-2xl theme-transition">
        <div className="absolute top-6 left-8 z-10">
           <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
             Intelligence Output
           </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          {isProcessing ? (
            <div className="text-center space-y-8 animate-pulse">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-pink-600/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <p className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-sm italic">Gemini Core Active</p>
                <p className="text-neutral-400 dark:text-neutral-700 text-[10px] uppercase font-bold tracking-tighter">Re-drawing visual nodes based on directives...</p>
              </div>
            </div>
          ) : editedImage ? (
            <div className="relative group max-h-full w-full flex items-center justify-center">
              <img src={editedImage} alt="Edited Result" className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain transition-transform duration-700 group-hover:scale-[1.01]" />
              <div className="absolute bottom-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => downloadImage(editedImage)}
                  className="p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-2xl text-neutral-900 dark:text-white border border-white/20 hover:scale-110 active:scale-95 transition shadow-2xl"
                  title="Download Result"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
              <div className="absolute top-6 right-6 bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">
                Render Success
              </div>
            </div>
          ) : originalImage ? (
            <div className="text-center space-y-6 opacity-30">
              <div className="relative mx-auto w-64 h-64 grayscale blur-[2px]">
                 <img src={originalImage} className="w-full h-full object-contain rounded-2xl" alt="Placeholder" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-700 text-[10px] font-black uppercase tracking-widest">Inference Standby</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto transition-transform hover:rotate-12 duration-700">
                 <i className="fas fa-wand-sparkles text-4xl text-neutral-300 dark:text-neutral-800"></i>
              </div>
              <div className="space-y-2">
                <p className="text-neutral-500 dark:text-neutral-700 text-[10px] font-black uppercase tracking-[0.3em] italic">Workspace Standby</p>
                <p className="text-neutral-400 dark:text-neutral-800 text-[9px] font-bold uppercase tracking-tighter">Import an asset to initiate magic editing</p>
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
      `}</style>
    </div>
  );
};

export default ImageEditTool;
