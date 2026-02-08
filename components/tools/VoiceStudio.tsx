
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { MODELS } from '../../constants';
import { GeminiService, encode, decode, decodeAudioData } from '../../services/geminiService';

type VoiceMode = 'live' | 'tts';

const VoiceStudio: React.FC = () => {
  const [mode, setMode] = useState<VoiceMode>('live');
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  
  // Voice Cloning States
  const [clonedVoiceSample, setClonedVoiceSample] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const [useClonedVoice, setUseClonedVoice] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const voices = [
    { name: 'Zephyr', desc: 'Smooth & Warm', bio: 'Ideal for helpful assistants and friendly narration.' },
    { name: 'Kore', desc: 'Authoritative', bio: 'Great for professional presentations and formal news.' },
    { name: 'Puck', desc: 'Energetic', bio: 'A lively, high-energy voice for ads and excitement.' },
    { name: 'Charon', desc: 'Deep & Solemn', bio: 'Low-frequency, dramatic voice for cinematic impact.' },
    { name: 'Fenrir', desc: 'Sharp & Modern', bio: 'Clear, concise, and slightly edgy for tech content.' },
    { name: 'Aoede', desc: 'Melodic', bio: 'Soft and flowing, perfect for poetry or meditation.' },
    { name: 'Eos', desc: 'Bright', bio: 'Cheerful and optimistic for daily updates.' },
    { name: 'Orpheus', desc: 'Narrative', bio: 'Classic storyteller tone with natural pacing.' }
  ];

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setClonedVoiceSample({
          data: base64,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        });
        setUseClonedVoice(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = async (voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing) return;
    setIsPreviewing(voiceName);
    try {
      const base64Audio = await GeminiService.generateTTS(`Hello! I'm ${voiceName}. Testing vocal profile with current modulation.`, {
        voiceName,
        pitch: ttsPitch,
        speakingRate: ttsSpeed
      });
      await playAudio(base64Audio);
    } catch (error) {
      console.error("Preview failed:", error);
    } finally {
      setIsPreviewing(null);
    }
  };

  const handleCurrentConfigPreview = async () => {
    if (isPreviewing) return;
    setIsPreviewing('current-config');
    try {
      const text = "Testing vocal fingerprint and modulation for this studio project.";
      const base64Audio = await GeminiService.generateTTS(text, {
        voiceName: useClonedVoice ? undefined : selectedVoice,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        referenceAudio: useClonedVoice && clonedVoiceSample ? {
          data: clonedVoiceSample.data,
          mimeType: clonedVoiceSample.mimeType
        } : undefined
      });
      await playAudio(base64Audio);
    } catch (error) {
      console.error("Config preview failed:", error);
    } finally {
      setIsPreviewing(null);
    }
  };

  const handleClonedPreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing || !clonedVoiceSample) return;
    setIsPreviewing('cloned');
    try {
      const base64Audio = await GeminiService.generateTTS("Vocal fingerprint test successful. I am now speaking with your cloned voice characteristics and current modulation.", {
        referenceAudio: {
          data: clonedVoiceSample.data,
          mimeType: clonedVoiceSample.mimeType
        },
        pitch: ttsPitch,
        speakingRate: ttsSpeed
      });
      await playAudio(base64Audio);
    } catch (error) {
      console.error("Cloned preview failed:", error);
    } finally {
      setIsPreviewing(null);
    }
  };

  const playAudio = async (base64Data: string) => {
    if (!outAudioContextRef.current) {
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = outAudioContextRef.current!;
    const buffer = await decodeAudioData(decode(base64Data), ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const startSession = async (voiceOverride?: string) => {
    try {
      setStatus('Initializing...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceOverride || selectedVoice } }
          },
          systemInstruction: 'You are a helpful and charismatic creative assistant in the Hobbs Studio. Be concise and conversational.'
        },
        callbacks: {
          onopen: () => {
            setStatus('Live');
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => setStatus('Connection Error'),
          onclose: () => {
            setStatus('Standby');
            setIsActive(false);
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Setup Failed');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    // Note: We don't close the AudioContext here to allow for faster switching
    setIsActive(false);
    setStatus('Standby');
  };

  const handleVoiceSwitch = async (voiceName: string) => {
    if (selectedVoice === voiceName) return;
    
    setSelectedVoice(voiceName);
    
    if (isActive) {
      setStatus(`Syncing ${voiceName}...`);
      // Close current session
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      // Re-initiate immediately with new voice
      setTimeout(() => startSession(voiceName), 50);
    }
  };

  const applyPreset = (pitch: number, speed: number) => {
    setTtsPitch(pitch);
    setTtsSpeed(speed);
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim() || isGeneratingTTS) return;
    setIsGeneratingTTS(true);
    try {
      const base64Audio = await GeminiService.generateTTS(ttsText, {
        voiceName: selectedVoice,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        referenceAudio: useClonedVoice && clonedVoiceSample ? {
          data: clonedVoiceSample.data,
          mimeType: clonedVoiceSample.mimeType
        } : undefined
      });
      await playAudio(base64Audio);
    } catch (error) {
      console.error("TTS generation failed:", error);
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black dark:bg-black overflow-hidden theme-transition">
      {/* Sleek Mode Toggle Section */}
      <div className="flex justify-center p-6 border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md sticky top-0 z-20 theme-transition">
        <div className="relative flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl w-full max-w-sm shadow-inner border border-neutral-200 dark:border-neutral-800 theme-transition">
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-xl transition-all duration-300 shadow-lg ${
              mode === 'tts' ? 'translate-x-[calc(100%+3px)]' : 'translate-x-0'
            }`}
          />
          <button 
            onClick={() => { stopSession(); setMode('live'); }}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 z-10 flex items-center justify-center space-x-2 ${
              mode === 'live' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <i className="fas fa-headset text-sm"></i>
            <span>Live Studio</span>
          </button>
          <button 
            onClick={() => { stopSession(); setMode('tts'); }}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 z-10 flex items-center justify-center space-x-2 ${
              mode === 'tts' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <i className="fas fa-waveform-path text-sm"></i>
            <span>Speech Synthesis</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-black theme-transition">
        {mode === 'live' ? (
          <div className="max-w-4xl w-full text-center space-y-12 py-12 flex flex-col items-center">
            <div className="relative">
              <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center transition-all duration-700 ${
                isActive ? 'bg-indigo-600 shadow-[0_0_80px_rgba(79,70,229,0.4)] scale-110' : 'bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 scale-100'
              }`}>
                <i className={`fas fa-microphone text-6xl transition-all ${isActive ? 'text-white' : 'text-neutral-300 dark:text-neutral-700'}`}></i>
                {isActive && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 border-4 border-indigo-400 rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-0 border-8 border-indigo-400 rounded-full animate-ping opacity-10 [animation-delay:0.5s]"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight uppercase italic">Vocal Core Live</h3>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto font-medium">Ultra-low latency real-time voice intelligence for natural collaborative creation.</p>
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-md">
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  status === 'Live' ? 'bg-green-500 animate-pulse' : status === 'Standby' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-yellow-500 animate-spin'
                }`}></span>
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">{status}</span>
              </div>
            </div>

            <div className="w-full max-w-2xl space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Switch Persona Dynamically</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {voices.filter(v => ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'].includes(v.name)).map(v => (
                    <button
                      key={v.name}
                      onClick={() => handleVoiceSwitch(v.name)}
                      className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center space-y-2 ${
                        selectedVoice === v.name
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
                      }`}
                    >
                      <i className={`fas fa-wave-square text-[10px] ${selectedVoice === v.name ? 'text-white' : 'text-indigo-500'}`}></i>
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 w-full">
                {!isActive ? (
                  <button
                    onClick={() => startSession()}
                    className="w-full py-5 bg-indigo-600 text-white dark:bg-white dark:text-black rounded-2xl font-black text-lg hover:bg-indigo-500 dark:hover:bg-neutral-200 transition-all transform active:scale-95 shadow-2xl hover:shadow-indigo-500/20 uppercase tracking-tighter"
                  >
                    Initiate Persona: {selectedVoice}
                  </button>
                ) : (
                  <button
                    onClick={stopSession}
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-500 transition-all transform active:scale-95 shadow-2xl uppercase tracking-tighter"
                  >
                    Terminate Session
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl w-full space-y-8 bg-white dark:bg-neutral-900/40 p-6 md:p-10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800/60 my-8 shadow-xl dark:shadow-2xl theme-transition">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Speech Synthesizer</h3>
              <p className="text-neutral-500 text-sm font-medium">Professional grade vocal profiles with real-time inflection control.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Voice Selection */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4 flex justify-between items-center px-2">
                    <span>Vocal Library</span>
                    <span className="text-indigo-600 dark:text-indigo-400 italic normal-case font-bold">{useClonedVoice ? 'Vocal Fingerprint Active' : `${selectedVoice} Engine Selected`}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-3 custom-scrollbar">
                    {voices.map(v => (
                      <button
                        key={v.name}
                        onClick={() => { setSelectedVoice(v.name); setUseClonedVoice(false); }}
                        className={`p-5 rounded-2xl text-left border transition-all relative group overflow-hidden ${
                          !useClonedVoice && selectedVoice === v.name 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl ring-2 ring-indigo-400/20' 
                            : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-sm font-black tracking-tight">{v.name}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${!useClonedVoice && selectedVoice === v.name ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {v.desc}
                            </div>
                          </div>
                          <div 
                            onClick={(e) => handlePreview(v.name, e)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition shadow-md ${
                              isPreviewing === v.name ? 'bg-white text-indigo-600 animate-pulse' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800 group-hover:text-indigo-600'
                            }`}
                          >
                            <i className={`fas ${isPreviewing === v.name ? 'fa-spinner fa-spin' : 'fa-play text-[9px]'}`}></i>
                          </div>
                        </div>
                        <div className={`text-[11px] leading-relaxed font-medium ${!useClonedVoice && selectedVoice === v.name ? 'text-indigo-100 opacity-90' : 'text-neutral-500'}`}>
                          {v.bio}
                        </div>
                      </button>
                    ))}
                    
                    {/* Custom Cloned Voice Card */}
                    <button
                      onClick={() => clonedVoiceSample && setUseClonedVoice(true)}
                      disabled={!clonedVoiceSample}
                      className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden h-full flex flex-col justify-between group ${
                        useClonedVoice 
                          ? 'bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 border-indigo-400 text-white shadow-2xl ring-2 ring-indigo-400/50' 
                          : clonedVoiceSample 
                            ? 'bg-white dark:bg-neutral-950 border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:border-indigo-600 shadow-lg' 
                            : 'bg-neutral-100 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800/40 text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm font-black mb-1 flex items-center">
                            <i className="fas fa-fingerprint mr-2 text-xs"></i>
                            Custom Clone
                          </div>
                          {clonedVoiceSample && (
                            <div 
                              onClick={handleClonedPreview}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition shadow-md ${
                                isPreviewing === 'cloned' ? 'bg-white text-indigo-600 animate-pulse' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 group-hover:bg-indigo-500 group-hover:text-white'
                              }`}
                            >
                              <i className={`fas ${isPreviewing === 'cloned' ? 'fa-spinner fa-spin' : 'fa-play text-[9px]'}`}></i>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Neural Profile</div>
                        <div className="text-[11px] leading-relaxed font-medium">
                          {clonedVoiceSample ? 'Vocal fingerprint successfully captured and synced to synthesizer.' : 'Upload an audio sample below to initiate neural cloning.'}
                        </div>
                      </div>
                      {clonedVoiceSample && useClonedVoice && (
                        <div className="absolute -right-3 -bottom-3 opacity-20 transform rotate-12">
                          <i className="fas fa-microchip text-5xl"></i>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Voice Cloning Upload Area */}
                <div className="bg-white dark:bg-neutral-950/50 rounded-[2rem] p-8 border border-neutral-200 dark:border-neutral-800/50 shadow-inner theme-transition">
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-5 px-1">Neural Mapping Engine</label>
                  <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                    <div 
                      onClick={() => audioInputRef.current?.click()}
                      className={`flex-1 w-full h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        clonedVoiceSample ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50'
                      }`}
                    >
                      <i className={`fas ${clonedVoiceSample ? 'fa-check-circle text-indigo-400' : 'fa-waveform-lines text-neutral-300 dark:text-neutral-700'} text-2xl mb-2`}></i>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">
                        {clonedVoiceSample ? 'Fingerprint Active' : 'Import Voice Sample'}
                      </p>
                      <input type="file" hidden ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" />
                    </div>
                    
                    {clonedVoiceSample && (
                      <div className="w-full sm:w-60 space-y-3 bg-neutral-50 dark:bg-black/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/50 shadow-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase font-black tracking-widest">Core Profile</p>
                          <button 
                            onClick={() => { setClonedVoiceSample(null); setUseClonedVoice(false); }}
                            className="text-[9px] text-red-500 font-black uppercase hover:text-red-400"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                        <audio src={clonedVoiceSample.url} controls className="w-full h-8 brightness-90 grayscale opacity-80" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modulation Controls */}
              <div className="space-y-6 flex flex-col">
                <div className="bg-white dark:bg-neutral-950/80 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800/50 flex-1 space-y-10 shadow-lg dark:shadow-xl flex flex-col theme-transition">
                  <div className="space-y-10 flex-1">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                        <span>Neural Pitch</span>
                        <span className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">{ttsPitch.toFixed(1)}x</span>
                      </label>
                      <div className="relative pt-1">
                        <input 
                          type="range" min="0.5" max="2.0" step="0.1" 
                          value={ttsPitch} 
                          onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                        />
                      </div>
                      <div className="flex justify-between mt-4 text-[9px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-widest px-1">
                        <span>Low End</span>
                        <span>Default</span>
                        <span>Treble</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                        <span>Speech Tempo</span>
                        <span className="bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold">{ttsSpeed.toFixed(1)}x</span>
                      </label>
                      <div className="relative pt-1">
                        <input 
                          type="range" min="0.25" max="4.0" step="0.25" 
                          value={ttsSpeed} 
                          onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                        />
                      </div>
                      <div className="flex justify-between mt-4 text-[9px] text-neutral-400 dark:text-neutral-600 font-black uppercase tracking-widest px-1">
                        <span>Slow</span>
                        <span>Linear</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800/50">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-5">Vocal Logic Presets</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Standard', p: 1.0, s: 1.0 },
                          { label: 'Narrator', p: 0.9, s: 0.85 },
                          { label: 'Hype', p: 1.2, s: 1.25 },
                          { label: 'Minimal', p: 0.8, s: 0.75 }
                        ].map(preset => (
                          <button 
                            key={preset.label}
                            onClick={() => applyPreset(preset.p, preset.s)} 
                            className="text-[9px] font-black uppercase py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-neutral-400 dark:text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-auto">
                    <button
                      onClick={handleCurrentConfigPreview}
                      disabled={isPreviewing !== null || (useClonedVoice && !clonedVoiceSample)}
                      className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center space-x-3 border shadow-sm ${
                        isPreviewing === 'current-config' 
                        ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse' 
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-indigo-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <i className={`fas ${isPreviewing === 'current-config' ? 'fa-spinner fa-spin' : 'fa-play-circle'}`}></i>
                      <span>{isPreviewing === 'current-config' ? 'Generating Preview...' : 'Preview Vocal Profile'}</span>
                    </button>
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-700 text-center mt-3 uppercase tracking-tighter font-bold">Test modulation with current fingerprint</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-neutral-200 dark:border-neutral-800/50">
              <div>
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4 px-2">Input Script for Synthesis</label>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Paste script content for neural vocal generation..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-[2rem] p-8 h-40 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 resize-none text-sm text-neutral-800 dark:text-neutral-200 shadow-inner placeholder:text-neutral-300 dark:placeholder:text-neutral-700 transition-all font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                 <button
                  onClick={() => { setTtsPitch(1.0); setTtsSpeed(1.0); }}
                  className="px-8 py-5 bg-white dark:bg-neutral-900/50 text-neutral-400 dark:text-neutral-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all border border-neutral-200 dark:border-neutral-800 shadow-sm"
                >
                  Clear Config
                </button>
                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || !ttsText.trim()}
                  className="flex-1 py-5 bg-indigo-600 text-white dark:bg-white dark:text-black rounded-[1.5rem] font-black text-lg hover:bg-indigo-500 dark:hover:bg-neutral-200 transition-all transform active:scale-[0.98] disabled:opacity-30 shadow-2xl flex items-center justify-center relative overflow-hidden group"
                >
                  {isGeneratingTTS ? (
                    <div className="flex items-center space-x-3">
                       <div className="flex space-x-1 items-end h-6">
                        <div className="w-1.5 h-3 bg-white dark:bg-indigo-600 rounded-full animate-[voice-bar_0.8s_ease-in-out_infinite]"></div>
                        <div className="w-1.5 h-5 bg-white dark:bg-indigo-600 rounded-full animate-[voice-bar_0.8s_0.1s_ease-in-out_infinite]"></div>
                        <div className="w-1.5 h-4 bg-white dark:bg-indigo-600 rounded-full animate-[voice-bar_0.8s_0.2s_ease-in-out_infinite]"></div>
                        <div className="w-1.5 h-6 bg-white dark:bg-indigo-600 rounded-full animate-[voice-bar_0.8s_0.3s_ease-in-out_infinite]"></div>
                      </div>
                      <span className="uppercase tracking-widest text-sm">Synthesizing Neural Stream...</span>
                    </div>
                  ) : (
                    <>
                      <i className={`fas ${useClonedVoice ? 'fa-clone' : 'fa-wave-square'} mr-4 text-white dark:text-indigo-600 transition-transform group-hover:scale-125`}></i>
                      <span className="uppercase tracking-tight">{useClonedVoice ? 'Synthesize with Cloned Fingerprint' : 'Generate Master Track'}</span>
                    </>
                  )}
                  {useClonedVoice && <div className="absolute top-0 left-0 w-1.5 h-full bg-white dark:bg-indigo-500"></div>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        input[type='range']::-webkit-slider-thumb {
          height: 18px;
          width: 18px;
          border-radius: 6px;
          background: #6366f1;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -7px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          border: 2px solid white;
        }
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #e5e7eb;
          border-radius: 2px;
        }
        .dark input[type='range']::-webkit-slider-runnable-track {
          background: #1f2937;
        }
        @keyframes voice-bar {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
      `}</style>
    </div>
  );
};

export default VoiceStudio;
