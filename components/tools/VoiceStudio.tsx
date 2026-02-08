
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
// Fixed the import to remove non-existent HOBBS_AVATAR
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
  
  // Refined Stylistic States
  const [vocalTimbre, setVocalTimbre] = useState(50); 
  const [emotion, setEmotion] = useState('Neutral');
  
  // Granular Audio Effects
  const [reverbIntensity, setReverbIntensity] = useState(0);
  const [echoIntensity, setEchoIntensity] = useState(0);
  const [delayIntensity, setDelayIntensity] = useState(0);
  
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

  const emotions = [
    { id: 'Neutral', icon: 'fa-meh' },
    { id: 'Happy', icon: 'fa-laugh-beam' },
    { id: 'Sad', icon: 'fa-sad-tear' },
    { id: 'Concerned', icon: 'fa-exclamation-circle' }
  ];

  const getTimbreDesc = (val: number) => {
    if (val < 25) return 'Warm & Deep';
    if (val < 45) return 'Soft';
    if (val < 55) return 'Neutral';
    if (val < 75) return 'Bright';
    return 'Sharp & Piercing';
  };

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
      const base64Audio = await GeminiService.generateTTS(`Hobbs Studio voice test sequence.`, {
        voiceName,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        timbre: getTimbreDesc(vocalTimbre),
        reverb: reverbIntensity,
        echo: echoIntensity,
        delay: delayIntensity
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
      const text = "Synchronizing audio effects rack. Reverb, echo, and delay are now mapped to the vocal stream.";
      const base64Audio = await GeminiService.generateTTS(text, {
        voiceName: useClonedVoice ? undefined : selectedVoice,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        timbre: getTimbreDesc(vocalTimbre),
        reverb: reverbIntensity,
        echo: echoIntensity,
        delay: delayIntensity,
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
      const base64Audio = await GeminiService.generateTTS("Vocal fingerprint captured. Processing master audio effects.", {
        referenceAudio: {
          data: clonedVoiceSample.data,
          mimeType: clonedVoiceSample.mimeType
        },
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        timbre: getTimbreDesc(vocalTimbre),
        reverb: reverbIntensity,
        echo: echoIntensity,
        delay: delayIntensity
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
    setIsActive(false);
    setStatus('Standby');
  };

  const handleVoiceSwitch = async (voiceName: string) => {
    if (selectedVoice === voiceName) return;
    setSelectedVoice(voiceName);
    if (isActive) {
      setStatus(`Syncing ${voiceName}...`);
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      setTimeout(() => startSession(voiceName), 50);
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim() || isGeneratingTTS) return;
    setIsGeneratingTTS(true);
    try {
      const base64Audio = await GeminiService.generateTTS(ttsText, {
        voiceName: selectedVoice,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        timbre: getTimbreDesc(vocalTimbre),
        reverb: reverbIntensity,
        echo: echoIntensity,
        delay: delayIntensity,
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
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-black overflow-hidden theme-transition">
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
              mode === 'live' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <i className="fas fa-headset text-sm"></i>
            <span>Live Studio</span>
          </button>
          <button 
            onClick={() => { stopSession(); setMode('tts'); }}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 z-10 flex items-center justify-center space-x-2 ${
              mode === 'tts' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <i className="fas fa-waveform-path text-sm"></i>
            <span>Speech Synthesis</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto custom-scrollbar bg-neutral-50 dark:bg-black theme-transition">
        {mode === 'live' ? (
          <div className="max-w-4xl w-full text-center space-y-12 py-12 flex flex-col items-center animate-fade-in">
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
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs mx-auto font-medium">Ultra-low latency real-time voice intelligence.</p>
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-md">
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  status === 'Live' ? 'bg-green-500 animate-pulse' : status === 'Standby' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-yellow-500 animate-spin'
                }`}></span>
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">{status}</span>
              </div>
            </div>

            <div className="w-full max-w-2xl space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Switch Persona</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {voices.filter(v => ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'].includes(v.name)).map(v => (
                    <button
                      key={v.name}
                      onClick={() => handleVoiceSwitch(v.name)}
                      className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center space-y-2 ${
                        selectedVoice === v.name
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
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
                    className="w-full py-5 bg-indigo-600 text-white dark:bg-white dark:text-black rounded-2xl font-black text-lg hover:bg-indigo-500 dark:hover:bg-neutral-200 transition-all transform active:scale-95 shadow-2xl uppercase tracking-tighter"
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
          <div className="max-w-7xl w-full space-y-8 bg-white dark:bg-neutral-900/40 p-6 md:p-10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800/60 my-8 shadow-xl dark:shadow-2xl theme-transition animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Vocal Architecture Studio</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Professional grade vocal profiles with granular audio rack effects.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Left Column: Voice Library & Cloning */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4 flex justify-between items-center px-2">
                    <span>Neural Library</span>
                    <span className="text-indigo-600 dark:text-indigo-400 italic normal-case font-bold">{useClonedVoice ? 'Fingerprint' : selectedVoice}</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {voices.map(v => (
                      <button
                        key={v.name}
                        onClick={() => { setSelectedVoice(v.name); setUseClonedVoice(false); }}
                        className={`p-4 rounded-2xl text-left border transition-all relative group overflow-hidden ${
                          !useClonedVoice && selectedVoice === v.name 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl' 
                            : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-black tracking-tight">{v.name}</div>
                            <div className={`text-[9px] font-bold uppercase tracking-wider ${!useClonedVoice && selectedVoice === v.name ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {v.desc}
                            </div>
                          </div>
                          <div 
                            onClick={(e) => handlePreview(v.name, e)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition shadow-md ${
                              isPreviewing === v.name ? 'bg-white text-indigo-600 animate-pulse' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600'
                            }`}
                          >
                            <i className={`fas ${isPreviewing === v.name ? 'fa-spinner fa-spin' : 'fa-play text-[8px]'}`}></i>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => clonedVoiceSample && setUseClonedVoice(true)}
                      disabled={!clonedVoiceSample}
                      className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                        useClonedVoice 
                          ? 'bg-gradient-to-br from-indigo-700 to-violet-700 border-indigo-400 text-white shadow-2xl' 
                          : clonedVoiceSample 
                            ? 'bg-white dark:bg-neutral-950 border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:border-indigo-600' 
                            : 'bg-neutral-100 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800/40 text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-[10px] font-black italic uppercase flex items-center">
                          <i className="fas fa-fingerprint mr-2"></i> Fingerprint
                        </div>
                        {clonedVoiceSample && (
                          <div 
                            onClick={handleClonedPreview}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition shadow-md ${
                              isPreviewing === 'cloned' ? 'bg-white text-indigo-600 animate-pulse' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600'
                            }`}
                          >
                            <i className={`fas ${isPreviewing === 'cloned' ? 'fa-spinner fa-spin' : 'fa-play text-[8px]'}`}></i>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-950/50 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800/50 shadow-inner">
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4">Neural Mapping</label>
                  <div 
                    onClick={() => audioInputRef.current?.click()}
                    className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      clonedVoiceSample ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <i className={`fas ${clonedVoiceSample ? 'fa-check-circle text-indigo-400' : 'fa-upload text-neutral-300 dark:text-neutral-700'} mb-1`}></i>
                    <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                      {clonedVoiceSample ? 'Sample Synced' : 'Import Voice'}
                    </p>
                    <input type="file" hidden ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" />
                  </div>
                </div>
              </div>

              {/* Middle Section: Advanced Modulation & Effects */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-neutral-950/50 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800/50 shadow-lg flex flex-col space-y-8">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                        <span>Vocal Timbre</span>
                        <span className="text-indigo-600 font-mono text-[10px]">{getTimbreDesc(vocalTimbre)}</span>
                      </label>
                      <input 
                        type="range" min="0" max="100" 
                        value={vocalTimbre} 
                        onChange={(e) => setVocalTimbre(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-[8px] text-neutral-400 font-black uppercase tracking-widest px-1">
                        <span>Warm</span>
                        <span>Bright</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-1">Prosody State (Emotion)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {emotions.map(e => (
                          <button
                            key={e.id}
                            onClick={() => setEmotion(e.id)}
                            className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
                              emotion === e.id 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-indigo-500/50'
                            }`}
                          >
                            <i className={`fas ${e.icon}`}></i>
                            <span>{e.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-neutral-100 dark:border-neutral-900 pt-8">
                    {/* Audio Effects Rack */}
                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-1 flex items-center">
                        <i className="fas fa-sliders-h mr-2 text-indigo-500"></i>
                        Neural Effects Rack
                      </label>
                      
                      {/* Reverb Control */}
                      <div className="space-y-2 px-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <span className="text-neutral-500">Reverb Wetness</span>
                          <span className="text-indigo-600">{reverbIntensity}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={reverbIntensity} 
                          onChange={(e) => setReverbIntensity(parseInt(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Echo Control */}
                      <div className="space-y-2 px-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <span className="text-neutral-500">Echo Slapback</span>
                          <span className="text-indigo-600">{echoIntensity}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={echoIntensity} 
                          onChange={(e) => setEchoIntensity(parseInt(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Delay Control */}
                      <div className="space-y-2 px-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                          <span className="text-neutral-500">Feedback Delay</span>
                          <span className="text-indigo-600">{delayIntensity}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" 
                          value={delayIntensity} 
                          onChange={(e) => setDelayIntensity(parseInt(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                            <span>Engine Speed</span>
                            <span className="text-indigo-600 font-mono text-[10px]">{ttsSpeed.toFixed(1)}x</span>
                          </label>
                          <input 
                            type="range" min="0.25" max="2.0" step="0.25" 
                            value={ttsSpeed} 
                            onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                       </div>

                       <div className="space-y-4">
                          <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] flex justify-between items-center px-1">
                            <span>Vocal Pitch</span>
                            <span className="text-indigo-600 font-mono text-[10px]">{ttsPitch.toFixed(1)}x</span>
                          </label>
                          <input 
                            type="range" min="0.25" max="2.0" step="0.25" 
                            value={ttsPitch} 
                            onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                       </div>

                       <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900/50">
                          <button 
                            onClick={handleCurrentConfigPreview}
                            disabled={isPreviewing !== null || isGeneratingTTS}
                            className="w-full py-5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98]"
                          >
                            {isPreviewing === 'current-config' ? (
                              <>
                                <i className="fas fa-circle-notch fa-spin"></i>
                                <span>Mastering Preview...</span>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-ear-listen text-indigo-500"></i>
                                <span>Preview Studio Track</span>
                              </>
                            )}
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Generation Panel */}
              <div className="lg:col-span-1 flex flex-col space-y-6">
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Paste studio script for master vocal track..."
                  className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-[2rem] p-6 h-full focus:outline-none focus:ring-4 focus:ring-indigo-600/10 resize-none text-[13px] text-neutral-800 dark:text-neutral-200 shadow-inner placeholder:text-neutral-300 dark:placeholder:text-neutral-700 transition-all font-medium"
                />

                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || !ttsText.trim()}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs hover:bg-indigo-500 transition-all transform active:scale-[0.98] disabled:opacity-30 shadow-2xl flex items-center justify-center relative group"
                >
                  {isGeneratingTTS ? (
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span className="uppercase tracking-widest">Generating master...</span>
                    </div>
                  ) : (
                    <>
                      <i className={`fas ${useClonedVoice ? 'fa-clone' : 'fa-wave-square'} mr-3 transition-transform group-hover:scale-125`}></i>
                      <span className="uppercase tracking-widest">Establish Studio Master</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
        input[type='range']::-webkit-slider-thumb {
          height: 14px; width: 14px; border-radius: 4px; background: #6366f1;
          cursor: pointer; -webkit-appearance: none; margin-top: -5px;
          box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4); border: 1.5px solid white;
        }
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%; height: 4px; cursor: pointer; background: #e5e7eb; border-radius: 2px;
        }
        .dark input[type='range']::-webkit-slider-runnable-track { background: #1f2937; }
      `}</style>
    </div>
  );
};

export default VoiceStudio;
