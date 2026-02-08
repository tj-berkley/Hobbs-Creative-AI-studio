
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

const ImageEditTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null); // Reset result when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Extract base64 data from the data URL
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

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `hobbs-edit-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden">
      {/* Controls Panel */}
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Source Image</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl flex items-center justify-center cursor-pointer hover:border-pink-500/50 transition group relative overflow-hidden"
          >
            {originalImage ? (
              <>
                <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-bold bg-pink-600 px-3 py-1 rounded-full">Change Image</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <i className="fas fa-cloud-arrow-up text-3xl text-neutral-700 mb-3"></i>
                <p className="text-xs text-neutral-500 font-medium">Click to upload or drag & drop</p>
                <p className="text-[10px] text-neutral-700 mt-1 uppercase">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
          <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Editing Instructions</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Add a futuristic visor to the person', 'Change the background to a Mars colony', 'Make the colors more vibrant and cinematic'"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-pink-600/50 resize-none text-sm text-neutral-200"
          />
        </div>

        <button
          onClick={handleEdit}
          disabled={isProcessing || !originalImage || !prompt.trim()}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold shadow-xl shadow-pink-900/20 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <i className="fas fa-wand-sparkles fa-spin"></i>
              <span>Processing Magic...</span>
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles"></i>
              <span>Apply Edit</span>
            </>
          )}
        </button>

        {originalImage && (
          <button 
            onClick={() => { setOriginalImage(null); setEditedImage(null); setPrompt(''); }}
            className="w-full text-neutral-600 hover:text-neutral-400 text-xs font-bold uppercase transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Result Panel */}
      <div className="flex-1 bg-neutral-950 rounded-3xl border border-neutral-900 flex flex-col overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
           <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
             Preview
           </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {isProcessing ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-neutral-500 text-sm animate-pulse">Gemini is redrawing your image...</p>
            </div>
          ) : editedImage ? (
            <div className="relative group max-h-full w-full flex items-center justify-center">
              <img src={editedImage} alt="Edited Result" className="max-h-full max-w-full rounded-lg shadow-2xl object-contain" />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  onClick={() => downloadImage(editedImage)}
                  className="p-3 bg-pink-600 text-white rounded-full hover:bg-pink-500 transition shadow-lg"
                  title="Download Result"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
          ) : originalImage ? (
            <div className="text-center space-y-4 opacity-40">
              <img src={originalImage} className="max-h-[300px] rounded-lg grayscale blur-sm" alt="Placeholder" />
              <p className="text-neutral-500 text-sm">Waiting for instructions...</p>
            </div>
          ) : (
            <div className="text-center text-neutral-800 max-w-xs">
              <i className="fas fa-wand-sparkles text-8xl mb-6 opacity-5"></i>
              <p className="text-sm font-medium">Upload an image and describe how you want to transform it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditTool;
