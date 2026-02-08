
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

    const languageLabel = LANGUAGES.find(l => l.id === selectedLanguage)?.name || selectedLanguage;

    const config: TranscriptionConfig = {
      language: languageLabel,
      dialectDetails: dialectDetails,
      domain: selectedDomain,
      speakerCount,
      speakerNames: speakerNames,
      cleanFillers,
      enableDiarization,
      keywords,
      acousticEnvironment: selectedEnv
    };

    try {
      const result = await GeminiService.transcribeAudio(audioFile.data, config);
      setTranscription(result || "Neural processing yielded no text.");
    } catch (error) {
      console.error("Transcription failed:", error);
      setTranscription("Inference Error: Transcription engine failed to resolve. Check your master asset and linguistic profile.");
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
    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden bg-transparent">
      {/* Precision Configuration Side */}
      <div className="w-full lg:w-[420px] space-y-6 flex-shrink-0 flex flex-col overflow-y-auto pr-3 custom-scrollbar">
        
        {/* Step Header */}
        <div className="flex items-center space-x-2 px-1 mb-2">
          {[1, 2, 3].map(step => (
            <button 
              key={step}
              onClick={() => setActiveStep(step)}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${activeStep >= step ? 'bg-teal-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}
            />
          ))}
        </div>

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
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-teal-600 px-4 py-2 rounded-xl">Switch Asset</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-waveform-path text-2xl text-neutral-300 dark:text-neutral-800 mb-2 group-hover:text-teal-500 transition-colors"></i>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">Load Audio Master</p>
                  </div>
                )}
              </div>
              <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Neural Linguistic Core</label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.slice(0, 10).map((lang) => (
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
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-widest px-1">Regional Dialect / Accent</label>
                <input
                  type="text"
                  value={dialectDetails}
                  onChange={(e) => setDialectDetails(e.target.value)}
                  placeholder="e.g. Scottish High-lands, Southern US, Swiss German..."
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[11px] text-neutral-800 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-teal-500/50 shadow-inner"
                />
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Semantic Domain Insight</label>
              <div className="grid grid-cols-2 gap-2">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col space-y-2 ${
                      selectedDomain === domain.id
                        ? 'bg-neutral-800 dark:bg-neutral-100 border-neutral-700 dark:border-white text-white dark:text-black shadow-lg'
                        : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 hover:border-teal-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${domain.icon} text-xs`}></i>
                      <span className="text-[10px] font-black uppercase tracking-tight">{domain.id}</span>
                    </div>
                    <p className="text-[8px] opacity-60 leading-tight">{domain.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Acoustic Profiling</label>
              <div className="grid grid-cols-4 gap-2">
                {ENVIRONMENTS.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnv(env.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center space-y-2 transition-all ${
                      selectedEnv === env.id 
                        ? 'bg-teal-500 border-teal-400 text-white shadow-lg'
                        : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <i className={`fas ${env.icon} text-xs`}></i>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-center">{env.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Speaker Intelligence</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Speaker Count</label>
                  <select 
                    value={speakerCount}
                    onChange={(e) => setSpeakerCount(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-tight text-neutral-600 dark:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                  >
                    <option value="auto">Auto-Count</option>
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3+">3+ People</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-neutral-400 uppercase tracking-widest px-1">Diarization</label>
                  <button 
                    onClick={() => setEnableDiarization(!enableDiarization)}
                    className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      enableDiarization ? 'bg-teal-500/10 border-teal-500/30 text-teal-600' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {enableDiarization ? 'Sync On' : 'Sync Off'}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={speakerNames}
                onChange={(e) => setSpeakerNames(e.target.value)}
                placeholder="Names: Sarah (Host), Mike (Guest)..."
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[11px] text-neutral-800 dark:text-neutral-300 placeholder:text-neutral-200 dark:placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-teal-500/50 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Custom Lexical Cache</label>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="List technical terms, unique names, or acronyms for priority mapping..."
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[11px] text-neutral-800 dark:text-neutral-300 placeholder:text-neutral-200 dark:placeholder:text-neutral-800 focus:outline-none focus:ring-1 focus:ring-teal-500/50 shadow-inner h-24 resize-none"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex space-x-3 pt-4">
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
              className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/10"
            >
              Configure Next
            </button>
          ) : (
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing || !audioFile}
              className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-teal-500 disabled:opacity-30 transition-all shadow-xl shadow-teal-900/20 active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              {isTranscribing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Decoding...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-brain"></i>
                  <span>Initiate Decode</span>
                </>
              )}
            </button>
          )}
        </div>

        {audioFile && (
          <button 
            onClick={() => { setAudioFile(null); setTranscription(null); setActiveStep(1); }}
            className="text-neutral-400 dark:text-neutral-700 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition text-center w-full pt-4"
          >
            Reset Studio Session
          </button>
        )}
      </div>

      {/* Accuracy Driven Output Side */}
      <div className="flex-1 bg-white/50 dark:bg-neutral-900/10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800/60 flex flex-col overflow-hidden relative shadow-sm dark:shadow-2xl theme-transition">
        
        {/* Dynamic Status Header */}
        <div className="absolute top-6 left-8 z-10 flex items-center justify-between w-[calc(100%-4rem)]">
           <div className="flex items-center space-x-4">
             <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center">
               <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isTranscribing ? 'bg-teal-500 animate-pulse' : 'bg-neutral-300'}`}></span>
               {selectedDomain} Processor
             </div>
             {dialectDetails && (
               <div className="hidden sm:flex bg-teal-500/10 dark:bg-teal-500/5 px-3 py-1 rounded-full text-[9px] font-black text-teal-600 dark:text-teal-500 uppercase border border-teal-500/20">
                 Dialect: {dialectDetails}
               </div>
             )}
           </div>
           
           {transcription && (
             <button 
              onClick={handleCopy}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all ${
                isCopied ? 'bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-500 shadow-lg' : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-400 hover:text-indigo-600'
              }`}
             >
               <i className={`fas ${isCopied ? 'fa-check' : 'fa-copy'} text-[10px]`}></i>
               <span className="text-[10px] font-black uppercase tracking-widest">{isCopied ? 'Captured' : 'Export Copy'}</span>
             </button>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-24 custom-scrollbar">
          {isTranscribing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-12">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-[6px] border-teal-500/10 flex items-center justify-center">
                  <div className="w-16 h-16 border-[6px] border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="text-center space-y-4">
                <p className="text-neutral-900 dark:text-white font-black uppercase tracking-[0.4em] text-sm italic">Resolving Acoustic Nodes</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-[8px] font-bold text-neutral-500 uppercase rounded">Calibrating: {selectedEnv}</span>
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-[8px] font-bold text-neutral-500 uppercase rounded">Nuance: {dialectDetails || 'Standard'}</span>
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 text-[8px] font-bold text-neutral-500 uppercase rounded">Domain: {selectedDomain}</span>
                </div>
              </div>
            </div>
          ) : transcription ? (
            <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
              <div className="bg-white dark:bg-neutral-950/80 rounded-[2.5rem] p-12 border border-neutral-200 dark:border-neutral-800/50 shadow-xl dark:shadow-2xl relative">
                <div className="text-neutral-800 dark:text-neutral-300 leading-[2.6] text-[16px] font-medium whitespace-pre-wrap selection:bg-teal-500/30 font-serif">
                  {transcription}
                </div>
                <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-900 flex justify-between items-center text-[9px] text-neutral-400 dark:text-neutral-700 font-black uppercase tracking-widest">
                  <div className="flex space-x-6">
                    <span className="flex items-center"><i className="fas fa-check-double text-teal-500 mr-2"></i> Verified Domain: {selectedDomain}</span>
                    <span className="flex items-center"><i className="fas fa-satellite-dish text-teal-500 mr-2"></i> Env Profile: {selectedEnv}</span>
                  </div>
                  <span>Hobbs Neural Output v3.1</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-300 dark:text-neutral-900 max-w-sm mx-auto space-y-8">
              <div className="w-24 h-24 rounded-[2rem] bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center mx-auto transition-transform hover:rotate-6 duration-700">
                 <i className="fas fa-file-waveform text-4xl opacity-[0.2] dark:opacity-[0.1]"></i>
              </div>
              <div className="space-y-4">
                <h4 className="text-neutral-500 dark:text-neutral-700 font-black uppercase tracking-[0.3em] text-[11px] italic">Neural Interface Standby</h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-800 leading-relaxed font-bold uppercase tracking-tighter">Define your linguistic profile and acoustic environment to initiate precision temporal decoding.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TranscriptionTool;
