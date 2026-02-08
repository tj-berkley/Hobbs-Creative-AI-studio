
import React, { useState } from 'react';
import { GeminiService } from '../../services/geminiService';
import { StoryGenre, ScriptProject, ScriptScene } from '../../types';

interface StoryEngineProps {
  onExportToMovieStudio: (project: ScriptProject) => void;
}

const GENRES: { id: StoryGenre; icon: string; desc: string; color: string }[] = [
  { id: 'Fiction', icon: 'fa-book-open', desc: 'Narrative world-building', color: 'indigo' },
  { id: 'Non-Fiction', icon: 'fa-landmark', desc: 'Fact-based intelligence', color: 'teal' },
  { id: 'Storyteller', icon: 'fa-feather', desc: 'Cinematic narration', color: 'emerald' },
  { id: 'Scary Nights', icon: 'fa-ghost', desc: 'High-tension horror', color: 'red' },
  { id: 'Comedy', icon: 'fa-face-laugh-squint', desc: 'Humor & Quick Wit', color: 'yellow' },
  { id: 'Drama', icon: 'fa-masks-theater', desc: 'Emotional depth', color: 'pink' },
  { id: 'Action', icon: 'fa-fire', desc: 'High-octane sequences', color: 'orange' },
  { id: 'Thriller', icon: 'fa-bolt', desc: 'Edge-of-seat mystery', color: 'purple' },
  { id: 'Children\'s Book', icon: 'fa-cloud-sun', desc: 'Vibrant & Simple', color: 'sky' }
];

const StoryEngine: React.FC<StoryEngineProps> = ({ onExportToMovieStudio }) => {
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('Fiction');
  const [premise, setPremise] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [fullStory, setFullStory] = useState<string | null>(null);
  const [isConvertingToScript, setIsConvertingToScript] = useState(false);
  const [scriptScenes, setScriptScenes] = useState<ScriptScene[] | null>(null);
  const [projectTitle, setProjectTitle] = useState('');

  const handleGenerateStory = async () => {
    if (!premise.trim() || isGeneratingStory) return;
    setIsGeneratingStory(true);
    try {
      const story = await GeminiService.generateStory(selectedGenre, premise);
      setFullStory(story || null);
    } catch (err) {
      console.error(err);
      alert("Neural cluster timed out. Verify directive complexity.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleConvertToScript = async () => {
    if (!fullStory || isConvertingToScript) return;
    setIsConvertingToScript(true);
    try {
      const scenesData = await GeminiService.convertStoryToScript(fullStory, selectedGenre);
      const scenes: ScriptScene[] = scenesData.map((s: any, i: number) => ({
        ...s,
        id: Math.random().toString(36).substr(2, 9),
        order: i + 1
      }));
      setScriptScenes(scenes);
    } catch (err) {
      console.error(err);
      alert("Script decomposition failed. Re-initiating story core.");
    } finally {
      setIsConvertingToScript(false);
    }
  };

  const handleExport = () => {
    if (!scriptScenes || !projectTitle) return;
    const project: ScriptProject = {
      id: Math.random().toString(36).substr(2, 9),
      title: projectTitle,
      genre: selectedGenre,
      premise,
      fullStory: fullStory || '',
      scenes: scriptScenes
    };
    onExportToMovieStudio(project);
  };

  const activeGenreColor = GENRES.find(g => g.id === selectedGenre)?.color || 'emerald';

  return (
    <div className="h-full flex flex-col p-8 gap-8 overflow-hidden bg-transparent theme-transition">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Left: Input & Config */}
        <div className="w-full lg:w-[450px] flex flex-col space-y-6 flex-shrink-0 overflow-y-auto pr-3 custom-scrollbar">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Story Blueprint</label>
            <div className="grid grid-cols-3 gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all group ${
                    selectedGenre === genre.id
                      ? `bg-${genre.color}-600/10 border-${genre.color}-500 text-${genre.color}-600 dark:text-${genre.color}-400 shadow-xl`
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-emerald-500/30'
                  }`}
                >
                  <i className={`fas ${genre.icon} text-lg mb-2`}></i>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{genre.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center px-1">
               <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Creative Premise</label>
               <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded uppercase border border-indigo-500/20 italic">Publish-Ready Core</span>
            </div>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g. In a world where silence is currency, a street performer discovers a lost vault of sound..."
              className="w-full h-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 text-[14px] text-neutral-900 dark:text-neutral-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner resize-none font-medium leading-relaxed"
            />
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={isGeneratingStory || !premise.trim()}
            className="w-full py-6 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:opacity-80 transition-all flex items-center justify-center space-x-3"
          >
            {isGeneratingStory ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-feather"></i>}
            <span>Manifest Story Arc</span>
          </button>
        </div>

        {/* Right: Output Workspace */}
        <div className="flex-1 bg-white/50 dark:bg-[#080808] rounded-[3rem] border border-neutral-200 dark:border-neutral-900 flex flex-col overflow-hidden relative shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] theme-transition">
          <div className="absolute top-8 left-10 z-10">
            <div className={`bg-white/80 dark:bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl border border-neutral-200 dark:border-white/5 text-[10px] font-black text-${activeGenreColor}-600 uppercase tracking-[0.3em] shadow-sm`}>
              {selectedGenre} Narrative Engine
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 pt-24 custom-scrollbar">
            {isGeneratingStory ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                <div className={`w-20 h-20 rounded-[2rem] border-[6px] border-${activeGenreColor}-500 border-t-transparent animate-spin`}></div>
                <div className="text-center space-y-2">
                  <p className="text-neutral-900 dark:text-white font-black uppercase tracking-widest text-sm italic">Architecting Narrative Nodes</p>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase">Calibrating ${selectedGenre} themes & character beats...</p>
                </div>
              </div>
            ) : scriptScenes ? (
              <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-8">
                  <div className="space-y-4 flex-1 mr-8">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Production Identity</label>
                    <input 
                      type="text" 
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder="ENTER PRODUCTION TITLE..."
                      className="w-full bg-transparent text-4xl font-black italic uppercase tracking-tighter text-emerald-500 focus:outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-900"
                    />
                  </div>
                  <button 
                    onClick={handleExport}
                    disabled={!projectTitle.trim()}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center space-x-3"
                  >
                    <i className="fas fa-film"></i>
                    <span>Export to Movie Studio</span>
                  </button>
                </div>

                <div className="space-y-12">
                   {scriptScenes.map((scene, idx) => (
                     <div key={scene.id} className="p-10 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] space-y-8 shadow-sm relative group">
                        <div className="absolute -left-4 top-10 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-[10px] shadow-lg">0{idx+1}</div>
                        
                        <div className="flex justify-between items-start">
                           <h5 className="text-lg font-black italic uppercase tracking-tight text-neutral-400">{scene.setting}</h5>
                           <div className="flex items-center space-x-3">
                              <span className="text-[9px] font-black bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-full uppercase text-neutral-500 border border-neutral-200 dark:border-neutral-800">{scene.estimatedDuration}s Node</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-6 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                                 <p className="text-[9px] font-black uppercase text-emerald-500 mb-2">Visual Directive</p>
                                 <p className="text-xs font-medium leading-relaxed italic text-neutral-800 dark:text-neutral-300">"{scene.visualDirective}"</p>
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[9px] font-black uppercase text-neutral-400 px-1">Action Flow</p>
                                 <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">{scene.actionPrompt}</p>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="p-6 bg-indigo-600/5 dark:bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-4">
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-indigo-500 mb-1 flex items-center">
                                       <i className="fas fa-video mr-2"></i> Director's Suggestion
                                    </p>
                                    <p className="text-[11px] font-medium leading-relaxed italic text-neutral-600 dark:text-neutral-400">{scene.directorSuggestions}</p>
                                 </div>
                                 <div className="pt-4 border-t border-indigo-500/10">
                                    <p className="text-[9px] font-black uppercase text-pink-500 mb-1 flex items-center">
                                       <i className="fas fa-eye mr-2"></i> Engagement Strategy
                                    </p>
                                    <p className="text-[11px] font-medium leading-relaxed text-neutral-600 dark:text-neutral-400">{scene.engagementTriggers}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {scene.dialogue && (
                          <div className="mt-4 pt-6 border-t border-neutral-50 dark:border-neutral-900 text-center bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-3xl">
                             <p className="text-[10px] font-black uppercase text-emerald-600 mb-2">DIALOGUE SEQUENCE</p>
                             <p className="text-2xl font-black italic text-neutral-900 dark:text-white leading-tight">"{scene.dialogue}"</p>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            ) : fullStory ? (
              <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                       <h3 className="text-5xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white leading-none">Draft Generated.</h3>
                       <span className="text-[10px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase">Commercial Quality</span>
                    </div>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Linguistic Nodes successfully synchronized into a stable narrative masterpiece.</p>
                 </div>
                 <div className="p-12 bg-white dark:bg-black/40 border border-neutral-100 dark:border-neutral-800 rounded-[3rem] text-xl font-medium leading-[2.2] font-serif shadow-inner whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                    {fullStory}
                 </div>
                 <div className="flex flex-col md:flex-row items-center gap-6">
                    <button 
                      onClick={handleConvertToScript}
                      disabled={isConvertingToScript}
                      className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center space-x-4"
                    >
                      {isConvertingToScript ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-invoice"></i>}
                      <span>Architect Scene Script + Director's Suite</span>
                    </button>
                    <button 
                      onClick={() => setFullStory(null)}
                      className="flex-1 py-6 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-neutral-200 transition"
                    >
                      Discard & Re-Roll
                    </button>
                 </div>
                 <p className="text-[10px] text-neutral-500 font-bold uppercase text-center italic">This text is formatted for direct literary export and sale.</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-sm mx-auto">
                 <div className={`w-32 h-32 rounded-[3rem] bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center shadow-inner group transition-transform duration-1000 hover:rotate-6`}>
                    <i className="fas fa-pen-nib text-5xl text-neutral-300 dark:text-neutral-700 group-hover:text-emerald-500 transition-colors"></i>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-neutral-900 dark:text-white">Narrative Core Standby</h4>
                    <p className="text-xs text-neutral-500 font-medium leading-relaxed italic px-6">Provide a directive on the left to initiate multi-genre story manifestion and automated script architecture.</p>
                 </div>
              </div>
            )}
          </div>
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

export default StoryEngine;
