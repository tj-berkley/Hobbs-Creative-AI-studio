
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const ChatTool: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await GeminiService.chat(input, {
        useThinking,
        useSearch,
        useMaps
      });

      const modelMsg: ChatMessage = {
        role: 'model',
        text: response.text || "I couldn't generate a response.",
        id: (Date.now() + 1).toString(),
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: "Error: Failed to reach the Hobbs AI core. Please check your secure connection.",
        id: (Date.now() + 1).toString(),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 dark:bg-black/20">
      <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-600 space-y-8 animate-fade-in">
            <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-2 border-indigo-600/30 shadow-2xl shadow-indigo-600/10 bg-neutral-950">
              <span className="text-amber-400 font-black italic text-6xl select-none">H</span>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Hobbs Core Intelligence</p>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600/60 italic">Platform Strategy Active</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
              <button onClick={() => setInput("Draft a studio manifest for Hobbs.")} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left hover:border-indigo-500 transition shadow-sm group">
                <i className="fas fa-file-invoice text-indigo-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <br />Manifest Request
              </button>
              <button onClick={() => setInput("Latest trends in cinematic generative AI.")} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left hover:border-indigo-500 transition shadow-sm group">
                <i className="fas fa-chart-line text-indigo-500 mb-2 group-hover:scale-110 transition-transform"></i>
                <br />Market Analysis
              </button>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
            <div className={`flex items-start space-x-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!m.role.includes('user') && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-indigo-500/20 shadow-sm shrink-0 mt-1 bg-neutral-950">
                   <span className="text-amber-400 font-black italic text-xs select-none">H</span>
                </div>
              )}
              <div className={`rounded-[2rem] px-8 py-5 shadow-sm border ${
                m.role === 'user' 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/10' 
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}>
                <div className="whitespace-pre-wrap text-[13px] leading-relaxed font-medium">{m.text}</div>
                {m.groundingMetadata?.groundingChunks && (
                  <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] font-black text-neutral-400 dark:text-neutral-600 mb-3 uppercase tracking-widest">Neural Grounds</p>
                    <div className="flex flex-wrap gap-2">
                      {m.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                        const link = chunk.web?.uri || chunk.maps?.uri;
                        const title = chunk.web?.title || chunk.maps?.title || `Ref ${i+1}`;
                        return link ? (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-neutral-50 dark:bg-black/40 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition">
                            <i className="fas fa-link mr-1.5 opacity-40"></i> {title}
                          </a>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-4">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-indigo-500/10 shadow-sm shrink-0 bg-neutral-950/50">
                <span className="text-amber-400/50 font-black italic text-xs select-none">H</span>
             </div>
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-6 py-3 flex items-center space-x-3 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Processing</span>
             </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              useThinking ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:border-indigo-500'
            }`}
          >
            <i className="fas fa-microchip"></i>
            <span>Reflective Mode</span>
          </button>
          <button 
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              useSearch ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:border-blue-500'
            }`}
          >
            <i className="fab fa-google"></i>
            <span>Search Layer</span>
          </button>
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              useMaps ? 'bg-green-600 border-green-500 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:border-green-500'
            }`}
          >
            <i className="fas fa-map-location-dot"></i>
            <span>Spatial Insight</span>
          </button>
        </div>

        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Address Hobbs directly with your inquiry..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] p-6 pr-20 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 resize-none h-32 text-neutral-900 dark:text-neutral-200 transition-all duration-300 shadow-sm font-medium text-[13px] placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-4 bottom-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatTool;
