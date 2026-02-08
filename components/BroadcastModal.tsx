
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

interface BroadcastModalProps {
  mediaUrl: string;
  type: 'image' | 'video';
  prompt: string;
  onClose: () => void;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ mediaUrl, type, prompt, onClose }) => {
  const [platforms] = useState(['x', 'instagram', 'linkedin', 'tiktok']);
  const [selectedPlatform, setSelectedPlatform] = useState('x');
  const [caption, setCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<'idle' | 'success'>('idle');

  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const response = await GeminiService.chat(`Generate a viral and professional social media caption for a ${selectedPlatform} post. The content is an AI-generated ${type} based on this prompt: "${prompt}". Keep it elite and engaging for the Hobbs Studio brand.`);
      setCaption(response.text || '');
    } catch (err) {
      setCaption("Check out my latest creation from Hobbs Studio! #AI #Creative #Hobbs");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  useEffect(() => {
    generateCaption();
  }, [selectedPlatform]);

  const handlePost = () => {
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPostStatus('success');
      setTimeout(() => onClose(), 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-auto">
        {/* Preview Area */}
        <div className="md:w-1/2 bg-neutral-100 dark:bg-black flex items-center justify-center p-8 relative overflow-hidden">
          {type === 'image' ? (
            <img src={mediaUrl} className="max-w-full max-h-full rounded-2xl shadow-2xl" alt="Broadcast preview" />
          ) : (
            <video src={mediaUrl} autoPlay loop muted className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          )}
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
            Studio Master Preview
          </div>
        </div>

        {/* Composer Area */}
        <div className="md:w-1/2 p-10 flex flex-col space-y-8 bg-white dark:bg-neutral-950">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">Elite Broadcast</h4>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Network Distribution Engine</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-red-500 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Target Network</label>
            <div className="flex space-x-3">
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all border ${
                    selectedPlatform === p 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                      : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-emerald-500/50'
                  }`}
                >
                  <i className={`fab fa-${p}`}></i>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Post Context</label>
              <button 
                onClick={generateCaption} 
                className="text-[9px] font-black text-emerald-500 uppercase italic hover:underline flex items-center"
                disabled={isGeneratingCaption}
              >
                <i className={`fas fa-wand-sparkles mr-1.5 ${isGeneratingCaption ? 'animate-spin' : ''}`}></i>
                AI Re-Draft
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-32 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-[13px] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner font-medium leading-relaxed resize-none"
              placeholder="Crafting post directive..."
            />
          </div>

          <div className="pt-4">
            {postStatus === 'success' ? (
              <div className="w-full py-5 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs animate-bounce">
                <i className="fas fa-check-double mr-2"></i> Broadcast Successful
              </div>
            ) : (
              <button
                onClick={handlePost}
                disabled={isPosting || !caption}
                className="w-full py-5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-80 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3"
              >
                {isPosting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Syncing Grid...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-tower-broadcast"></i>
                    <span>Initiate Broadcast</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastModal;
