
import React, { useState, useRef } from 'react';
import { GeminiService, TranscriptionConfig } from '../../services/geminiService';

const LANGUAGES = [
  { id: 'auto', name: 'Auto-Detect', icon: 'fa-wand-magic-sparkles' },
  { id: 'en-US', name: 'English (US)', icon: 'fa-flag-usa' },
  { id: 'en-GB', name: 'English (UK)', icon: 'fa-gb' },
  { id: 'en-AU', name: 'English (AU)', icon: 'fa-australia' },
  { id: 'es-ES', name: 'Spanish (ES)', icon: 'fa-language' },
  { id: 'fr-FR', name: 'French', icon: 'fa-language' },
  { id: 'de-DE', name: 'German', icon: 'fa-language' },
  { id: 'ja-JP', name: 'Japanese', icon: 'fa-language' },
  { id: 'zh-CN', name: 'Chinese', icon: 'fa-language' },
  { id: 'other', name: 'Other Language', icon: 'fa-earth-africa' }
];

const DOMAINS = [
  { id: 'General', icon: 'fa-globe', desc: 'Everyday dialogue' },
  { id: 'Medical', icon: 'fa-stethoscope', desc: 'Healthcare & Clinical' },
  { id: 'Legal', icon: 'fa-gavel', desc: 'Law & Proceedings' },
  { id: 'Technical', icon: 'fa-microchip', desc: 'Engineering & IT' },
  { id: 'Finance', icon: 'fa-chart-line', desc: 'Market & Economics' },
  { id: 'Creative', icon: 'fa-palette', desc: 'Scripts & Media' }
];

const ENVIRONMENTS = [
  { id: 'Studio', icon: 'fa-microphone-lines', label: 'Studio Clean' },
  { id: 'Field', icon: 'fa-wind', label: 'Field/Outdoor' },
  { id: 'Call', icon: 'fa-phone', label: 'Telephone/VOIP' },
  { id: 'Crowd', icon: 'fa-users', label: 'Crowded/Noisy' }
];

const SPEAKER_OPTIONS = [
  { id: 'auto', label: 'Auto-Diarize', icon: 'fa-robot', desc: 'Detect & Label' },
  { id: '1', label: 'Monologue', icon: 'fa-user', desc: '1 Speaker' },
  { id: '2', label: 'Dialogue', icon: 'fa-user-group', desc: '2 Speakers' },
  { id: '3', label: 'Small Group', icon: 'fa-users', desc: '3 Speakers' },
  { id: '4', label: 'Discussion', icon: 'fa-users-between-lines', desc: '4 Speakers' },
  { id: '5+', label: 'Panel', icon: 'fa-users-viewfinder', desc: '5+ Speakers' }
];

const TranscriptionTool: React.FC = () => {
  const [audioFile, setAudioFile] = useState<{ name: string, data: string, url: string } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [dialectDetails, setDialectDetails] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('General');
  const [selectedEnv, setSelectedEnv] = useState('Studio');
  const [speakerCount, setSpeakerCount] = useState('auto');
  const [speakerNames, setSpeakerNames] = useState('');
  const [enableDiarization, setEnableDiarization] = useState(true);
  const [cleanFillers, setCleanFillers] = useState(true);
  const [keywords, setKeywords] = useState('');
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAudioFile({
          name: file.name,
          data: base64,
          url: URL.createObjectURL(file)
        });
        setTranscription(null);
        setIsCopied(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile || isTranscribing) return;
    setIsTranscribing(true);
    setTranscription(null);
    const config: TranscriptionConfig = {
      language: LANGUAGES.find(l => l.id === selectedLanguage)?.name || selectedLanguage,
      dialectDetails,
      domain: selectedDomain,
      speakerCount: speakerCount === 'auto' ? 'Detect Automatically and Diarize' : speakerCount,
      speakerNames,
      cleanFillers,
      enableDiarization: speakerCount === 'auto' ? true : enableDiarization,
      keywords,
      acousticEnvironment: selectedEnv
    };
    try {
      const result = await GeminiService.transcribeAudio(audioFile.data, config);
      setTranscription(result || "Neural processing yielded no text.");
    } catch (error) {
      console.error(error);
      setTranscription("Inference Error: Transcription engine failed to resolve nodes.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent theme-transition">
      <div className="w-full lg:w-[420px] space-y-6 flex-shrink-0 flex flex-col overflow-y-auto pr-3 custom-scrollbar">
        {/* Step Indicator */}
        <div className="flex items-center space-x-2 px-1 mb-2">
          {[1, 2, 3].map(step => (
            <button 
              key={step}
              onClick={() => setActiveStep(step)}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${activeStep >= step ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-neutral-200 dark:bg-neutral-800'}`}
            />
          ))}
        </div>

        {/* Step 1: Input & Neural Core */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Master Input</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[21/9] bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-teal-500/50 transition-all group relative overflow-hidden shadow-sm"
              >
                {audioFile ? (
                  <div className="text-center p-6 space-y-2">
                    <i className="fas fa-check-circle text-teal-500 text-xl"></i>
                    <p className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[250px] uppercase tracking-tighter">{audioFile.name}</p>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-waveform-path text-2xl text-neutral-300 dark:text-neutral-700 mb-2 group-hover:text-teal-500 transition-colors"></i>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">Load Audio Master</p>
                  </div>
                )}
              </div>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Neural Core Language</label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center space-x-3 ${
                      selectedLanguage === lang.id
                        ? 'bg-teal-600 border-teal-400 text-white shadow-lg'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-teal-500/50'
                    }`}
                  >
                    <i className={`fas ${lang.icon} text-[10px]`}></i>
                    <span className="text-[9px] font-black uppercase tracking-tight">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Semantic Domain, Environment & Keywords */}
        {activeStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Semantic Domain</label>
              <div className="grid grid-cols-2 gap-2">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col space-y-1 ${
                      selectedDomain === domain.id
                        ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-800 dark:border-white text-white dark:text-black shadow-xl'
                        : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 hover:border-teal-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${domain.icon} text-xs`}></i>
                      <span className="text-[10px] font-black uppercase tracking-tight">{domain.id}</span>
                    </div>
                    <span className={`text-[8px] font-bold ${selectedDomain === domain.id ? 'opacity-60' : 'opacity-40'}`}>{domain.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Technical Glossary & Keywords</label>
              <div className="relative group">
                <div className="absolute left-4 top-4 text-teal-500 opacity-40 group-focus-within:opacity-100 transition-opacity">
                  <i className="fas fa-tags text-xs"></i>
                </div>
                <textarea 
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="Enter industry jargon, acronyms, or specific names (e.g. SaaS, CUDA, Hobbs, AI-core)..."
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl pl-10 pr-4 py-4 text-[11px] font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 shadow-inner h-24 resize-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                />
              </div>
              <p className="px-1 text-[8px] font-bold text-neutral-400 uppercase tracking-widest italic">Supplying keywords helps the engine resolve ambiguous acoustic nodes.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Acoustic Environment</label>
              <div className="grid grid-cols-2 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center space-x-3 ${
                      selectedEnv === env.id
                        ? 'bg-teal-600 border-teal-400 text-white shadow-lg'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-teal-500/50'
                    }`}
                  >
                    <i className={`fas ${env.icon} text-[10px]`}></i>
                    <span className="text-[9px] font-black uppercase tracking-tight">{env.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Speaker Intelligence & Diarization */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Speaker Intelligence Configuration</label>
              <div className="grid grid-cols-2 gap-2">
                {SPEAKER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSpeakerCount(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center space-x-3 relative overflow-hidden group ${
                      speakerCount === opt.id
                        ? 'bg-teal-600 border-teal-400 text-white shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-teal-500/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${speakerCount === opt.id ? 'bg-white/20' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                      <i className={`fas ${opt.icon} text-[10px]`}></i>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-tight truncate">{opt.label}</span>
                      <span className="text-[7px] font-bold uppercase opacity-50 truncate">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-950 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-inner space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-fingerprint text-teal-500"></i>
                  <div>
                    <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">Diarization Engine</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-tighter">Automatic speaker identification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEnableDiarization(!enableDiarization)}
                  disabled={speakerCount === 'auto'}
                  className={`w-10 h-5 rounded-full relative transition-colors ${enableDiarization || speakerCount === 'auto' ? 'bg-teal-600' : 'bg-neutral-300 dark:bg-neutral-800'} ${speakerCount === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${(enableDiarization || speakerCount === 'auto') ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-broom text-teal-500"></i>
                  <div>
                    <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-tight">Cleanfill Process</p>
                    <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-tighter">Strip filler vocalizations</p>
                  </div>
                </div>
                <button 
                  onClick={() => setCleanFillers(!cleanFillers)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${cleanFillers ? 'bg-teal-600' : 'bg-neutral-300 dark:bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cleanFillers ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Speaker Mapping (Optional)</label>
              <input 
                type="text" 
                value={speakerNames}
                onChange={e => setSpeakerNames(e.target.value)}
                placeholder="Speaker 1: Alice, Speaker 2: Bob..."
                className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[11px] font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-neutral-100 dark:border-neutral-900/50">
          {activeStep > 1 && (
            <button 
              onClick={() => setActiveStep(prev => prev - 1)} 
              className="px-6 py-4 bg-neutral-100 dark:bg-neutral-900 rounded-2xl text-[10px] font-black uppercase text-neutral-500 hover:bg-neutral-200 transition"
            >
              Back
            </button>
          )}
          {activeStep < 3 ? (
            <button 
              onClick={() => setActiveStep(prev => prev + 1)} 
              className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-500 transition-all shadow-lg active:scale-95"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing || !audioFile}
              className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-500 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-30"
            >
              {isTranscribing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-brain"></i>}
              <span>{isTranscribing ? 'Decoding...' : 'Initiate Decode'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Viewport */}
      <div className="flex-1 bg-white/50 dark:bg-neutral-900/10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden relative shadow-sm dark:shadow-2xl theme-transition">
        <div className="absolute top-6 left-8 z-10 flex items-center justify-between w-[calc(100%-4rem)]">
           <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
             {selectedDomain} Intelligence Layer
           </div>
           {transcription && (
             <button onClick={handleCopy} className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all ${isCopied ? 'bg-teal-500/10 border-teal-500/20 text-teal-600' : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}>
               <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'} text-[10px]`}></i>
               <span className="text-[10px] font-black uppercase tracking-widest">{isCopied ? 'Captured' : 'Copy'}</span>
             </button>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-24 custom-scrollbar">
          {isTranscribing ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
              <div className="w-16 h-16 border-[6px] border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-2">
                <p className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-xs italic">Resolving Neural Nodes...</p>
                <p className="text-neutral-400 text-[9px] font-bold uppercase tracking-tighter">Automatic Diarization active: mapping speakers & semantic context</p>
              </div>
            </div>
          ) : transcription ? (
            <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-950/80 rounded-[2.5rem] p-12 border border-neutral-200 dark:border-neutral-800/50 shadow-xl dark:shadow-2xl theme-transition">
              <div className="text-neutral-800 dark:text-neutral-300 leading-[2.6] text-[15px] font-medium whitespace-pre-wrap font-serif">
                {transcription}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-300 dark:text-neutral-800 max-w-sm mx-auto space-y-8">
              <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-inner">
                <i className="fas fa-file-waveform text-4xl opacity-[0.2]"></i>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-tighter">Linguistic Decoding System</p>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Complete steps 1-3 to initiate precision speaker labeling.</p>
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

export default TranscriptionTool;
