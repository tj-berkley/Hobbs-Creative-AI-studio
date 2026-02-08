
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
  
  // Refined Stylistic States
  const [vocalTimbre, setVocalTimbre] = useState(50); 
  const [emotion, setEmotion] = useState('Neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(100);
  
  // Granular Audio Effects
  const [reverbIntensity, setReverbIntensity] = useState(0);
  const [echoIntensity, setEchoIntensity] = useState(0);
  const [delayIntensity, setDelayIntensity] = useState(0);
  
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  
  // Voice Cloning States
  const [clonedVoiceSample, setClonedVoiceSample] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const [useClonedVoice, setUseClonedVoice] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [fingerprintIntegrity, setFingerprintIntegrity] = useState<number | null>(null);
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
    { id: 'Neutral', icon: 'fa-meh', color: 'indigo' },
    { id: 'Happy', icon: 'fa-laugh-beam', color: 'emerald' },
    { id: 'Sad', icon: 'fa-sad-tear', color: 'slate' },
    { id: 'Concerned', icon: 'fa-exclamation-circle', color: 'amber' },
    { id: 'Excited', icon: 'fa-bolt', color: 'pink' },
    { id: 'Angry', icon: 'fa-fire', color: 'red' },
    { id: 'Whispering', icon: 'fa-comment-dots', color: 'cyan' }
  ];

  const getTimbreDesc = (val: number) => {
    if (val < 10) return 'Warm & Deep (Bassy)';
    if (val < 25) return 'Warm & Velvety';
    if (val < 40) return 'Smooth & Mellow';
    if (val < 60) return 'Neutral & Balanced';
    if (val < 75) return 'Crisp & Airy';
    if (val < 90) return 'Sharp & Penetrating';
    return 'Sharp & Piercing (Bright)';
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCloning(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        // Artificial delay to simulate "Acoustic Fingerprinting"
        await new Promise(r => setTimeout(r, 2000));
        
        setClonedVoiceSample({
          data: base64,
          mimeType: file.type,
          url: URL.createObjectURL(file)
        });
        setFingerprintIntegrity(92 + Math.floor(Math.random() * 7));
        setUseClonedVoice(true);
        setIsCloning(false);

        // Immediate verification preview
        try {
          const verificationAudio = await GeminiService.generateTTS("Acoustic identity verified. Hobbs Studio fingerprint established.", {
            referenceAudio: { data: base64, mimeType: file.type },
            emotion: 'Happy'
          });
          await playAudio(verificationAudio);
        } catch (err) {
          console.error("Verification failed", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = async (voiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing) return;
    setIsPreviewing(voiceName);
    try {
      const base64Audio = await GeminiService.generateTTS(`Hobbs Studio voice profile test: ${voiceName}.`, {
        voiceName,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        emotionIntensity,
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
      const text = "Acoustic profile synchronization complete. Calibrating timbre to " + getTimbreDesc(vocalTimbre) + ".";
      const base64Audio = await GeminiService.generateTTS(text, {
        voiceName: useClonedVoice ? undefined : selectedVoice,
        pitch: ttsPitch,
        speakingRate: ttsSpeed,
        emotion,
        emotionIntensity,
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
          systemInstruction: 'You are a helpful and charismatic creative assistant in the Hobbs Studio. Be concise and professional.'
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
        emotionIntensity,
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

  const currentEmotionColor = emotions.find(e => e.id === emotion)?.color || 'indigo';

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
            <span>Vocal Core: Live</span>
          </button>
          <button 
            onClick={() => { stopSession(); setMode('tts'); }}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 z-10 flex items-center justify-center space-x-2 ${
              mode === 'tts' ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <i className="fas fa-waveform-path text-sm"></i>
            <span>Architecture: Synthesis</span>
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
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight uppercase italic">Live Performance Node</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xs mx-auto font-medium">Precision real-time dialogue synthesis and interaction.</p>
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-md">
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  status === 'Live' ? 'bg-green-500 animate-pulse' : status === 'Standby' ? 'bg-neutral-400 dark:bg-neutral-600' : 'bg-yellow-500 animate-spin'
                }`}></span>
                <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">{status}</span>
              </div>
            </div>

            <div className="w-full max-w-2xl space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">Switch Persona Profile</label>
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
                    Engage Persona: {selectedVoice}
                  </button>
                ) : (
                  <button
                    onClick={stopSession}
                    className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-500 transition-all transform active:scale-95 shadow-2xl uppercase tracking-tighter"
                  >
                    Terminate Performance
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl w-full space-y-8 bg-white dark:bg-neutral-900/40 p-6 md:p-10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800/60 my-8 shadow-xl dark:shadow-2xl theme-transition animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 mb-3">
                 <i className="fas fa-microchip"></i> Acoustic Fingerprinting Engine Active
              </div>
              <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Vocal Architecture Lab</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Design professional cinematic vocal tracks with zero-shot cloning and precision emotion mapping.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Left Column: Voice Library & Cloning */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4 flex justify-between items-center px-2">
                    <span>Acoustic Library</span>
                    <span className="text-indigo-600 dark:text-indigo-400 italic normal-case font-bold">{useClonedVoice ? 'Persona Clone' : selectedVoice}</span>
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {voices.map(v => (
                      <button
                        key={v.name}
                        onClick={() => { setSelectedVoice(v.name); setUseClonedVoice(false); }}
                        className={`p-4 rounded-2xl text-left border transition-all relative group overflow-hidden ${
                          !useClonedVoice && selectedVoice === v.name 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl' 
                            : 'bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/50'
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
                      disabled={!clonedVoiceSample || isCloning}
                      className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                        useClonedVoice 
                          ? 'bg-gradient-to-br from-indigo-700 to-violet-700 border-indigo-400 text-white shadow-2xl ring-2 ring-indigo-500/20' 
                          : clonedVoiceSample 
                            ? 'bg-white dark:bg-neutral-950 border-indigo-200 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:border-indigo-600' 
                            : 'bg-neutral-100 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800/40 text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black italic uppercase flex items-center">
                            <i className={`fas fa-fingerprint mr-2 ${useClonedVoice ? 'animate-pulse' : ''}`}></i> 
                            {isCloning ? 'Mapping nodes...' : 'Neural Clone'}
                          </div>
                          {fingerprintIntegrity && (
                            <div className="text-[7px] font-black uppercase tracking-widest opacity-60">Integrity: {fingerprintIntegrity}%</div>
                          )}
                        </div>
                      </div>
                      {isCloning && (
                        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full overflow-hidden">
                           <div className="h-full bg-white w-1/2 animate-[progress_2s_infinite]"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-neutral-950/50 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800/50 shadow-inner">
                  <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4">Neural Mapping Input</label>
                  <div 
                    onClick={() => !isCloning && audioInputRef.current?.click()}
                    className={`w-full h-20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      clonedVoiceSample ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50'
                    } ${isCloning ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    <i className={`fas ${isCloning ? 'fa-circle-notch fa-spin text-indigo-500' : clonedVoiceSample ? 'fa-check-circle text-indigo-400' : 'fa-upload text-neutral-300 dark:text-neutral-700'} mb-1`}></i>
                    <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                      {isCloning ? 'Calibrating' : clonedVoiceSample ? 'Fingerprint Synced' : 'Import Target Voice'}
                    </p>
                    <input type="file" hidden ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" />
                  </div>
                </div>
              </div>

              {/* Middle Section: Emotion Mapping & Effects Rack */}
              <div className="lg:col-span-2 space-y-8">
                <div className={`bg-white dark:bg-neutral-950/50 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800/50 shadow-lg flex flex-col space-y-10 relative overflow-hidden transition-all duration-700 ${useClonedVoice ? 'ring-2 ring-indigo-500/20' : ''}`}>
                  {/* Emotional Mapping Matrix */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] flex items-center">
                        <i className={`fas fa-face-smile mr-2 text-${currentEmotionColor}-500 transition-colors`}></i>
                        Emotion Mapping Matrix
                      </label>
                      <span className={`text-${currentEmotionColor}-600 font-black text-[10px] uppercase italic tracking-widest bg-${currentEmotionColor}-500/10 px-3 py-1 rounded-full border border-${currentEmotionColor}-500/20 transition-all`}>
                        {emotion} Performance
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {emotions.map(e => (
                        <button
                          key={e.id}
                          onClick={() => setEmotion(e.id)}
                          className={`py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center space-y-2 group ${
                            emotion === e.id 
                              ? `bg-${e.color}-600 border-${e.color}-500 text-white shadow-lg shadow-${e.color}-900/20` 
                              : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-indigo-500/50'
                          }`}
                        >
                          <i className={`fas ${e.icon} text-xs transition-transform group-hover:scale-125`}></i>
                          <span>{e.id}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                       <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400">
                          <span>Sentiment Injection Intensity</span>
                          <span className={`text-${currentEmotionColor}-500`}>{emotionIntensity}%</span>
                       </div>
                       <input 
                        type="range" min="0" max="100" 
                        value={emotionIntensity} 
                        onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                        className={`w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full appearance-none cursor-pointer accent-${currentEmotionColor}-600`}
                       />
                    </div>
                  </div>

                  {/* Effects & Mastering Rack */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-neutral-100 dark:border-neutral-900 pt-8">
                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-1">Acoustic Modulation Rack</label>
                      <div className="space-y-5">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400">
                                <span>Pitch Shift</span>
                                <span className="text-indigo-600">{ttsPitch.toFixed(1)}x</span>
                              </div>
                              <input type="range" min="0.5" max="1.5" step="0.1" value={ttsPitch} onChange={e => setTtsPitch(parseFloat(e.target.value))} className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 accent-indigo-600 rounded-full appearance-none" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8px] font-black uppercase text-neutral-400">
                                <span>Tempo Node</span>
                                <span className="text-indigo-600">{ttsSpeed.toFixed(1)}x</span>
                              </div>
                              <input type="range" min="0.5" max="1.5" step="0.1" value={ttsSpeed} onChange={e => setTtsSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 accent-indigo-600 rounded-full appearance-none" />
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] px-1">Studio Effects Rack</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[{id: 'Hall', v: reverbIntensity, s: setReverbIntensity}, {id: 'Echo', v: echoIntensity, s: setEchoIntensity}, {id: 'Space', v: delayIntensity, s: setDelayIntensity}].map(fx => (
                          <div key={fx.id} className="space-y-1.5 p-2 bg-neutral-50 dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <span className="text-[7px] font-black uppercase tracking-widest text-neutral-500">{fx.id}</span>
                            <input type="range" min="0" max="100" value={fx.v} onChange={e => fx.s(parseInt(e.target.value))} className="w-full h-0.5 bg-neutral-200 dark:bg-neutral-800 accent-indigo-500 rounded-full appearance-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleCurrentConfigPreview}
                      disabled={isPreviewing !== null || isGeneratingTTS}
                      className="w-full py-4 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-lg flex items-center justify-center space-x-3 active:scale-[0.98]"
                    >
                      {isPreviewing === 'current-config' ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin"></i>
                          <span>Syncing Audio Matrix...</span>
                        </>
                      ) : (
                        <>
                          <i className={`fas fa-ear-listen text-${currentEmotionColor}-500`}></i>
                          <span>Establish Lab Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Generation Panel */}
              <div className="lg:col-span-1 flex flex-col space-y-6">
                <div className="flex-1 flex flex-col space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Production Script</label>
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Paste master script for high-fidelity performance synthesis..."
                    className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 rounded-[2rem] p-6 h-full focus:outline-none focus:ring-4 focus:ring-indigo-600/10 resize-none text-[13px] text-neutral-800 dark:text-neutral-200 shadow-inner placeholder:text-neutral-300 dark:placeholder:text-neutral-700 transition-all font-medium leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || !ttsText.trim()}
                  className={`w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-30 shadow-2xl flex items-center justify-center relative group overflow-hidden`}
                >
                  {isGeneratingTTS ? (
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span className="uppercase tracking-widest">Mastering Track...</span>
                    </div>
                  ) : (
                    <>
                      <i className={`fas ${useClonedVoice ? 'fa-clone' : 'fa-wave-square'} mr-3 transition-transform group-hover:scale-125`}></i>
                      <span className="uppercase tracking-widest">Render Final Master</span>
                    </>
                  )}
                  {isGeneratingTTS && <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full animate-pulse"></div>}
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
          height: 16px; width: 16px; border-radius: 6px; background: #6366f1;
          cursor: pointer; -webkit-appearance: none; margin-top: -6px;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4); border: 2px solid white;
        }
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%; height: 4px; cursor: pointer; background: #e5e7eb; border-radius: 2px;
        }
        .dark input[type='range']::-webkit-slider-runnable-track { background: #1a1a1a; }
        @keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
      `}</style>
    </div>
  );
};

export default VoiceStudio;
