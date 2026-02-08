
import React, { useState, useRef } from 'react';
import { KnowledgeEntry } from '../../types';

const KnowledgeBank: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploading(true);
      // Simulate indexing and training
      setTimeout(() => {
        const newEntries: KnowledgeEntry[] = Array.from(files).map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          fileType: file.type || 'Document',
          contentSummary: 'Analyzing brand tone, stylistic nuances, and core vocabulary...',
          addedAt: Date.now(),
          status: 'indexed'
        }));
        setEntries(prev => [...newEntries, ...prev]);
        setIsUploading(false);
      }, 3000);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 lg:p-12 space-y-12 animate-fade-in bg-neutral-50 dark:bg-[#030303]">
      <header className="space-y-4">
        <div className="inline-flex items-center space-x-2 bg-emerald-600/10 border border-emerald-600/20 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <i className="fas fa-vault mr-1"></i> Neural Bank Encrypted
        </div>
        <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Neural Bank</h3>
        <p className="text-neutral-500 font-medium italic">Train Hobbs AI on your brand voice, stylistic blueprints, and strategic guidelines.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`w-full aspect-square bg-white dark:bg-neutral-900 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center p-12 text-center cursor-pointer transition-all ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/40 shadow-sm'}`}
           >
              {isUploading ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Indexing Brand Voice...</p>
                </div>
              ) : (
                <div className="space-y-6 group">
                  <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-950 rounded-3xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
                    <i className="fas fa-file-arrow-up text-3xl text-neutral-300 dark:text-neutral-700 group-hover:text-emerald-500 transition-colors"></i>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-widest">Ingest Knowledge Node</h5>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter">PDF, TXT, DOCX, MD<br />Max 20MB per node</p>
                  </div>
                </div>
              )}
              <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileUpload} />
           </div>

           <div className="bg-neutral-900 p-8 rounded-[2.5rem] shadow-xl space-y-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><i className="fas fa-dna text-6xl"></i></div>
              <h5 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Voice Synthesis Status</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase italic">
                  <span>Brand Persona Sync</span>
                  <span>{entries.length > 0 ? '84%' : '0%'}</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: entries.length > 0 ? '84%' : '0%' }}></div>
                </div>
              </div>
              <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-tighter leading-relaxed">
                Ingest at least 3 knowledge nodes to establish a stable stylistic fingerprint for Hobbs Studio interactions.
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
             <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Knowledge Registry</h4>
             <span className="text-[10px] font-bold text-emerald-500 uppercase">{entries.length} Nodes Active</span>
           </div>

           <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="h-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 opacity-30">
                  <i className="fas fa-folder-open text-4xl mb-4"></i>
                  <p className="text-[10px] font-black uppercase tracking-widest">Bank Standby</p>
                </div>
              ) : (
                entries.map(entry => (
                  <div key={entry.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 flex items-center justify-between hover:border-emerald-500/30 transition-all animate-fade-in shadow-sm group">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-neutral-950 rounded-xl flex items-center justify-center text-emerald-500 text-lg border border-emerald-500/20">
                         <i className={entry.fileType.includes('pdf') ? 'fas fa-file-pdf' : 'fas fa-file-lines'}></i>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase text-neutral-800 dark:text-neutral-200">{entry.fileName}</p>
                        <p className="text-[9px] text-neutral-500 font-bold leading-relaxed">{entry.contentSummary}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase border border-emerald-500/20">Indexed</span>
                      <button className="text-neutral-400 hover:text-red-500 transition-colors"><i className="fas fa-trash-can text-[10px]"></i></button>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBank;
