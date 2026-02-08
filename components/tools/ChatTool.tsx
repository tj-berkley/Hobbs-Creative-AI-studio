
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
        text: "Error: Failed to reach the Hobbs AI core. Ensure your platform bridge is authorized.",
        id: (Date.now() + 1).toString(),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-neutral-50 dark:bg-[#030303]">
      <div className="flex-1 overflow-y-auto space-y-8 mb-8 pr-4 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-700 space-y-10 animate-fade-in">
            <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10 bg-neutral-950 animate-float">
              <i className="fas fa-chess-knight text-emerald-400 text-6xl"></i>
            </div>
            <div className="text-center space-y-3">
              <p className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Hobbs Strategic Intelligence</p>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600/60 italic">Studio Infrastructure Online</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-4">
              <button onClick={() => setInput("Draft a studio expansion strategy for Hobbs Studio.")} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-left hover:border-emerald-500 transition-all shadow-sm group">
                <i className="fas fa-chess-board text-emerald-500 mb-3 block text-xl group-hover:scale-110 transition-transform"></i>
                Strategic Roadmap
              </button>
              <button onClick={() => setInput("Analyze current trends in creative platform integration.")} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-[10px] font-black uppercase tracking-widest text-left hover:border-emerald-500 transition-all shadow-sm group">
                <i className="fas fa-magnifying-glass-chart text-emerald-500 mb-3 block text-xl group-hover:scale-110 transition-transform"></i>
                Market Intelligence
              </button>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}>
            <div className={`flex items-start space-x-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!m.role.includes('user') && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-sm shrink-0 mt-1 bg-neutral-950">
                   <i className="fas fa-chess-knight text-emerald-400 text-sm"></i>
                </div>
              )}
              <div className={`rounded-[2rem] px-8 py-6 shadow-sm border ${
                m.role === 'user' 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20' 
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}>
                <div className="whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{m.text}</div>
                {m.groundingMetadata?.groundingChunks && (
                  <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-4">Neural Data Nodes</p>
                    <div className="flex flex-wrap gap-2">
                      {m.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                        const link = chunk.web?.uri || chunk.maps?.uri;
                        const title = chunk.web?.title || chunk.maps?.title || `Ref ${i+1}`;
                        return link ? (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-neutral-50 dark:bg-black/40 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all hover:scale-105">
                            <i className="fas fa-link mr-2 opacity-40"></i> {title}
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
             <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-emerald-500/10 shadow-sm shrink-0 bg-neutral-950/50">
                <i className="fas fa-chess-knight text-emerald-400/50 text-sm"></i>
             </div>
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-8 py-4 flex items-center space-x-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic">Calculating Strategy</span>
             </div>
          </div>
        )}
      </div>

      <div className="space-y-5 pt-5 border-t border-neutral-100 dark:border-neutral-900/50">
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              useThinking ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-emerald-500'
            }`}
          >
            <i className="fas fa-brain"></i>
            <span>Reflective Core</span>
          </button>
          <button 
            onClick={() => setUseSearch(!useSearch)}
            className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              useSearch ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-blue-500'
            }`}
          >
            <i className="fab fa-google"></i>
            <span>Search Plane</span>
          </button>
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              useMaps ? 'bg-teal-600 border-teal-500 text-white shadow-lg' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-teal-500'
            }`}
          >
            <i className="fas fa-map-location-dot"></i>
            <span>Spatial Engine</span>
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
            placeholder="Engage Hobbs AI with a directive..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 pr-24 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none h-36 text-neutral-900 dark:text-neutral-200 transition-all duration-300 shadow-inner font-medium text-[14px] placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-6 bottom-6 w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 transition-all shadow-xl shadow-emerald-600/30 active:scale-95 group"
          >
            <i className="fas fa-paper-plane transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTool;
