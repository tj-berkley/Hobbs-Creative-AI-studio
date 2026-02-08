
import React, { useState, useRef } from 'react';
import { GeminiService } from '../../services/geminiService';

const ContentAnalysisTool: React.FC = () => {
  const [fileData, setFileData] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const [prompt, setPrompt] = useState('Provide a detailed analysis of this media, identifying key objects, actions, and the overall context.');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFileData({
          data: base64,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        });
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileData || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await GeminiService.analyzeMedia(
        { data: fileData.data, mimeType: fileData.mimeType },
        prompt
      );
      setAnalysis(response.text || "No analysis could be generated.");
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis("Error: Failed to analyze media. Please ensure the file format is supported and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden">
      {/* Input Side */}
      <div className="w-full lg:w-96 space-y-8 flex-shrink-0 flex flex-col">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Upload Media</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition group relative overflow-hidden"
          >
            {fileData ? (
              <div className="w-full h-full">
                {fileData.mimeType.startsWith('image/') ? (
                  <img src={fileData.url} className="w-full h-full object-contain" alt="Preview" />
                ) : (
                  <video src={fileData.url} className="w-full h-full object-contain" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-bold bg-indigo-600 px-3 py-1 rounded-full">Replace Media</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <i className="fas fa-file-import text-3xl text-neutral-700 mb-3"></i>
                <p className="text-xs text-neutral-500 font-medium">Image or Video</p>
                <p className="text-[10px] text-neutral-700 mt-1 uppercase">Click to select</p>
              </div>
            )}
          </div>
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*,video/*" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Analysis focus</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about the media..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 resize-none text-sm text-neutral-200"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !fileData}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-microscope"></i>
              <span>Start Analysis</span>
            </>
          )}
        </button>

        {fileData && (
          <button 
            onClick={() => { setFileData(null); setAnalysis(null); }}
            className="text-neutral-600 hover:text-neutral-400 text-xs font-bold uppercase transition"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Result Side */}
      <div className="flex-1 bg-neutral-950 rounded-3xl border border-neutral-900 flex flex-col overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10">
           <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
             Intelligence Output
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-16">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-neutral-500 text-sm animate-pulse">Gemini 3 Pro is processing frames...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-invert max-w-none">
              <div className="bg-neutral-900/40 rounded-2xl p-6 border border-neutral-800/50 text-neutral-200 leading-relaxed whitespace-pre-wrap text-sm">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-800 max-w-sm mx-auto">
              <i className="fas fa-brain text-8xl mb-6 opacity-5"></i>
              <h4 className="text-neutral-600 font-bold mb-2">Deep Media Understanding</h4>
              <p className="text-xs">Upload an asset on the left to unlock spatial, temporal, and semantic insights powered by the Gemini 3 Pro reasoning engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentAnalysisTool;
