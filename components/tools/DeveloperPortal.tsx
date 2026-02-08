
import React, { useState, useEffect } from 'react';
import { PlatformConfig, StudioToolType } from '../../types.ts';
import { TOOLS } from '../../constants.tsx';

interface DeveloperPortalProps {
  config: PlatformConfig;
  onConfigChange: (config: PlatformConfig) => void;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: number;
  lastUsed: number | null;
}

const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'whitelabeling' | 'monetization' | 'subdomain'>('infrastructure');
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isStripeConnected, setIsStripeConnected] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [platformCommission, setPlatformCommission] = useState(10);
  
  // Deployment Simulation
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  
  // API Key Management State
  const [apiKeys, setApiKeys] = useState<APIKey[]>(() => {
    const saved = localStorage.getItem('hobbs-api-keys');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: 'k1', 
        name: 'Master Production Bridge', 
        key: 'HOBBS_STUDIO_MASTER_SK_882_Z2A_PROD', 
        createdAt: Date.now() - 15552000000, 
        lastUsed: Date.now() - 3600000 
      }
    ];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('hobbs-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const generateNewKey = () => {
    if (!newKeyName.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const newKey: APIKey = {
        id: Math.random().toString(36).substr(2, 9),
        name: newKeyName,
        key: `HOBBS_${Math.random().toString(36).substr(2, 8).toUpperCase()}_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        createdAt: Date.now(),
        lastUsed: null
      };
      setApiKeys(prev => [newKey, ...prev]);
      setNewKeyName('');
      setIsGenerating(false);
    }, 1200);
  };

  const revokeKey = (id: string) => {
    if (confirm("Revoking this key will immediately terminate all associated platform bridges. Proceed?")) {
      setApiKeys(prev => prev.filter(k => k.id !== id));
    }
  };

  const handleWhitelabelUpdate = (field: keyof PlatformConfig, value: any) => {
    onConfigChange({ ...config, [field]: value, isDeployed: false });
  };

  const toggleTool = (toolId: StudioToolType) => {
    const newTools = config.enabledTools.includes(toolId)
      ? config.enabledTools.filter(id => id !== toolId)
      : [...config.enabledTools, toolId];
    handleWhitelabelUpdate('enabledTools', newTools);
  };

  const deployChanges = () => {
    setIsDeploying(true);
    setDeploymentLog([]);
    const logs = [
      "Initializing deployment pipeline...",
      `Checking ${config.subdomain}.hobbs.studio DNS resolution...`,
      "Synchronizing brand asset matrix...",
      `Provisioning whitelabel theme: ${config.brandColor}`,
      `Filtering user-accessible nodes: ${config.enabledTools.length} tools active`,
      "Verifying secure API bridges...",
      "Deployment complete. Subdomain is live."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setDeploymentLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDeploying(false);
          onConfigChange({ ...config, isDeployed: true });
        }, 1000);
      }
    }, 600);
  };

  const handleConnectStripe = () => {
    setIsConnectingStripe(true);
    setTimeout(() => {
      setIsStripeConnected(true);
      setIsConnectingStripe(false);
    }, 2500);
  };

  const embedCode = `<iframe 
  src="https://${config.subdomain}.hobbs.studio/embed" 
  width="100%" 
  height="800px" 
  frameborder="0" 
  allow="camera; microphone; display-capture; clipboard-read; clipboard-write"
></iframe>`;

  const dnsCname = `Type: CNAME | Host: ${config.subdomain} | Value: deploy.hobbs.studio`;

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 bg-transparent theme-transition">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div 
              className="inline-flex items-center space-x-2 border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ backgroundColor: `${config.brandColor}1a`, borderColor: `${config.brandColor}33`, color: config.brandColor }}
            >
              <i className="fas fa-bridge mr-1"></i> Platform Bridge
            </div>
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic">Control Plane</h3>
          </div>
          
          <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto custom-scrollbar">
            {['infrastructure', 'whitelabeling', 'monetization', 'subdomain'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                {tab === 'subdomain' ? 'Subdomain Mapping' : tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeTab === 'infrastructure' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">API Security Matrix</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Generate secrets to let your platform users programmatically interact with studio features</p>
                  </div>
                  <div 
                    className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                    style={{ backgroundColor: `${config.brandColor}1a`, borderColor: `${config.brandColor}33`, color: config.brandColor }}
                  >
                    {apiKeys.length} Active Nodes
                  </div>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="bg-neutral-50 dark:bg-black rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 group transition-all hover:border-[var(--brand-primary)]/30 shadow-inner flex items-center justify-between">
                      <div className="space-y-2 flex-1 min-w-0 pr-6">
                        <div className="flex items-center space-x-3">
                          <p className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate">{apiKey.name}</p>
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tabular-nums">Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="font-mono text-xs truncate" style={{ color: config.brandColor }}>
                            {apiKey.key.substring(0, 12)}••••••••••••••••
                          </code>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleCopy(apiKey.key, apiKey.id)} 
                          className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-[var(--brand-primary)] dark:hover:text-white transition-all flex items-center justify-center shadow-sm"
                          title="Copy Key"
                        >
                          <i className={`fas ${isCopied === apiKey.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                        </button>
                        <button 
                          onClick={() => revokeKey(apiKey.id)}
                          className="w-10 h-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                          title="Revoke Key"
                        >
                          <i className="fas fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800/50">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">New Node Identifier</label>
                      <input 
                        type="text" 
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                        placeholder="e.g. MyPlatform Mobile App"
                        className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-xs font-bold text-neutral-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] shadow-inner"
                      />
                    </div>
                    <button 
                      onClick={generateNewKey}
                      disabled={isGenerating || !newKeyName.trim()}
                      className="px-8 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all transform active:scale-95 flex items-center space-x-3"
                      style={{ backgroundColor: config.brandColor }}
                    >
                      {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-plus"></i>}
                      <span>Initialize Node</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 flex flex-col shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Platform Status</h4>
            <div 
              className="border rounded-2xl p-8 space-y-4"
              style={{ backgroundColor: `${config.brandColor}0d`, borderColor: `${config.brandColor}33` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.brandColor }}>Latency</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: config.brandColor }}>42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.brandColor }}>Subdomain Live</span>
                <span className="text-[10px] font-bold" style={{ color: config.brandColor }}>{config.subdomain}.hobbs.studio</span>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
               <div className="flex items-center justify-between px-2"><span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Integration Bridges</span><i className="fas fa-check-double text-green-500 text-[10px]"></i></div>
               {apiKeys.map(k => (
                 <div key={k.id} className="flex items-center space-x-3 p-4 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800/50 rounded-2xl group transition-all cursor-default">
                   <div className="w-1.5 h-1.5 rounded-full group-hover:animate-pulse" style={{ backgroundColor: config.brandColor }}></div>
                   <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-tight truncate">{k.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'whitelabeling' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
                 <div className="space-y-1">
                    <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Brand Orchestration</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Transform Hobbs Studio into your own branded environment</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Studio Instance Name</label>
                          <input 
                            type="text" 
                            value={config.name}
                            onChange={e => handleWhitelabelUpdate('name', e.target.value)}
                            className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] shadow-inner"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Primary Brand Color</label>
                          <div className="flex space-x-3">
                             <input 
                                type="color" 
                                value={config.brandColor}
                                onChange={e => handleWhitelabelUpdate('brandColor', e.target.value)}
                                className="w-16 h-14 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black cursor-pointer overflow-hidden p-1"
                             />
                             <input 
                                type="text" 
                                value={config.brandColor}
                                onChange={e => handleWhitelabelUpdate('brandColor', e.target.value)}
                                className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] shadow-inner font-mono"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Subdomain Provisioning</label>
                          <div className="flex">
                            <input 
                              type="text" 
                              value={config.subdomain}
                              onChange={e => handleWhitelabelUpdate('subdomain', e.target.value)}
                              className="flex-1 bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-l-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] shadow-inner"
                            />
                            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 border-l-0 rounded-r-2xl px-5 py-4 text-neutral-500 font-bold text-sm">.hobbs.studio</div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Platform Logo Icon</label>
                          <div className="grid grid-cols-4 gap-2">
                             {['fa-chess-knight', 'fa-bolt', 'fa-gem', 'fa-clapperboard', 'fa-brain-circuit', 'fa-code', 'fa-rocket', 'fa-shield-halved'].map(icon => (
                                <button 
                                  key={icon}
                                  onClick={() => handleWhitelabelUpdate('logoIcon', icon)}
                                  className={`w-full aspect-square rounded-xl border flex items-center justify-center transition-all ${config.logoIcon === icon ? 'bg-[var(--brand-primary)] text-white' : 'bg-neutral-50 dark:bg-black border-neutral-200 dark:border-neutral-800 text-neutral-400'}`}
                                >
                                   <i className={`fas ${icon}`}></i>
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-neutral-100 dark:border-neutral-800/50">
                    <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic mb-6">User-Facing Tool Access</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {TOOLS.filter(t => t.id !== StudioToolType.DEVELOPER).map(tool => (
                          <button
                            key={tool.id}
                            onClick={() => toggleTool(tool.id)}
                            className={`p-4 rounded-2xl border text-left flex items-center space-x-3 transition-all ${config.enabledTools.includes(tool.id) ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-800 dark:border-white text-white dark:text-black shadow-lg' : 'bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-400 opacity-60'}`}
                          >
                             <i className={`fas ${tool.icon} text-xs`}></i>
                             <span className="text-[9px] font-black uppercase tracking-tight">{tool.name}</span>
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 flex flex-col shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="space-y-4">
                 <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Deployment Matrix</h4>
                 <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Commit changes to your whitelabeled subdomain</p>
              </div>

              <div className="flex-1 bg-black rounded-3xl p-6 border border-neutral-800 shadow-inner relative overflow-hidden flex flex-col">
                 <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 font-mono text-[9px]">
                    {deploymentLog.map((log, i) => (
                       <div key={i} className="flex space-x-2 text-green-500 animate-fade-in">
                          <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                          <span className="text-white">&gt; {log}</span>
                       </div>
                    ))}
                    {isDeploying && <div className="w-1 h-3 bg-green-500 animate-pulse inline-block mt-1"></div>}
                 </div>
                 {!isDeploying && deploymentLog.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-700 opacity-40">
                       <i className="fas fa-terminal text-4xl mb-4"></i>
                       <p className="text-[9px] font-black uppercase">Provisioning Console Idle</p>
                    </div>
                 )}
              </div>

              <button 
                onClick={deployChanges}
                disabled={isDeploying || config.isDeployed}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all transform active:scale-95 flex items-center justify-center space-x-3 ${config.isDeployed ? 'bg-green-600 text-white opacity-60' : 'bg-[var(--brand-primary)] text-white hover:opacity-90'}`}
              >
                {isDeploying ? (
                   <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Pushing to Production...</span>
                   </>
                ) : config.isDeployed ? (
                   <>
                      <i className="fas fa-check-circle"></i>
                      <span>Build Deployed</span>
                   </>
                ) : (
                   <>
                      <i className="fas fa-rocket"></i>
                      <span>Deploy to {config.subdomain}</span>
                   </>
                )}
              </button>
           </div>
        </div>
      ) : activeTab === 'monetization' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
            <header className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Stripe Connect Bridge</h4>
                <p className="text-[11px] text-neutral-500 font-medium italic">Enable direct monetization on your external platform via Hobbs Studio infrastructure.</p>
              </div>
            </header>
            
            <div className={`p-10 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center space-y-8 transition-all ${isStripeConnected ? 'border-green-500/30 bg-green-500/5' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black/20'}`}>
              <div 
                className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl relative overflow-hidden transition-all duration-700 ${isStripeConnected ? 'bg-green-600 text-white rotate-0' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-300 rotate-12'}`}
              >
                <i className={isStripeConnected ? 'fas fa-shield-check' : 'fab fa-stripe-s'}></i>
              </div>
              
              {isStripeConnected ? (
                <div className="space-y-4 animate-fade-in text-center">
                  <div className="space-y-1">
                    <h5 className="font-black text-neutral-900 dark:text-white uppercase tracking-widest text-sm">PLATFORM_TREASURY_SYNC</h5>
                    <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">Active & Processing</span>
                  </div>
                  <button onClick={() => setIsStripeConnected(false)} className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 px-6 py-2 rounded-xl hover:bg-red-500/5 transition">Reset Bridge</button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Connect your platform's Stripe account to Hobbs Studio to manage marketplace revenue.</p>
                  <button 
                    onClick={handleConnectStripe}
                    disabled={isConnectingStripe}
                    className="px-12 py-5 bg-[#635bff] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#5851e0] transition-all shadow-2xl shadow-indigo-900/30 flex items-center justify-center space-x-3 active:scale-95"
                  >
                    {isConnectingStripe ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fab fa-stripe"></i>}
                    <span>Authorize Connector</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
            <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Marketplace Config</h4>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase text-neutral-500 px-1 tracking-widest">
                  <span>Platform Fee</span>
                  <span className="text-[var(--brand-primary)] tabular-nums">{platformCommission}%</span>
                </div>
                <input type="range" min="0" max="30" value={platformCommission} onChange={(e) => setPlatformCommission(parseInt(e.target.value))} className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Direct Payouts', 'Credit Marketplace', 'Usage Logs', 'Tax Compliance'].map(item => (
                  <div key={item} className="p-4 bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center transition-colors hover:border-[var(--brand-primary)]/20">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{item}</span>
                    <i className="fas fa-toggle-on text-green-500"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
           <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-10 space-y-10 shadow-sm dark:shadow-2xl">
              <header className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-lg italic">Domain & Connection Hub</h4>
                  <div className="px-4 py-1.5 bg-emerald-600/10 border border-emerald-600/20 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    Enterprise level Active: 6% split node
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 font-medium italic">Configure how your platform interacts with this Hobbs Studio instance. Enterprise Level enables full IFrame embedding and direct API bridge sync.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Step 1: DNS Record (Subdomain)</label>
                       <div className="relative group">
                          <pre className="bg-black p-6 rounded-2xl border border-neutral-800 shadow-inner overflow-x-auto">
                             <code className="font-mono text-[10px] text-emerald-400">
                                {dnsCname}
                             </code>
                          </pre>
                          <button 
                            onClick={() => handleCopy(dnsCname, 'dns-cname')}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                          >
                             <i className={`fas ${isCopied === 'dns-cname' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                          </button>
                       </div>
                       <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest px-1 italic">Note: Point your subdomain to this studio to enable the 6% revenue node.</p>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Step 2: Platform IFrame Embed (Enterprise Exclusive)</label>
                       <div className="relative group">
                          <pre className="bg-black p-6 rounded-2xl border border-neutral-800 shadow-inner overflow-x-auto">
                             <code className="font-mono text-[10px] text-indigo-400">
                                {embedCode}
                             </code>
                          </pre>
                          <button 
                            onClick={() => handleCopy(embedCode, 'embed-code')}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                          >
                             <i className={`fas ${isCopied === 'embed-code' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                          </button>
                       </div>
                       <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest px-1 italic">Use this to host your movie premiere and box office directly on your platform.</p>
                    </div>
                 </div>

                 <div className="bg-neutral-50 dark:bg-black/40 rounded-[2rem] p-8 border border-neutral-200 dark:border-neutral-800 space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Enterprise Handshake (Co-Director Sync)</h5>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">This script enables Hobbs AI to act as your Co-Director, pushing production status and ticket sale triggers directly to your platform's backend.</p>
                    <div className="relative group">
                       <pre className="bg-black p-6 rounded-2xl border border-neutral-800 shadow-inner overflow-x-auto">
                          <code className="font-mono text-[9px] text-neutral-400">
{`window.addEventListener('message', (event) => {
  if (event.origin !== 'https://${config.subdomain}.hobbs.studio') return;
  const { type, data } = event.data;
  
  if (type === 'PREMIERE_TICKET_SOLD') {
    // 94% user payout triggered
    console.log('Box Office Revenue Sync:', data.amount);
  }
  
  if (type === 'DIRECTOR_NODE_UPDATE') {
    // Hobbs AI production update
    updatePlatformUI(data.sceneStatus);
  }
});`}
                          </code>
                       </pre>
                       <button className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                          <i className="fas fa-copy"></i>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; }
        input[type='range']::-webkit-slider-thumb {
          background: var(--brand-primary);
        }
      `}</style>
    </div>
  );
};

export default DeveloperPortal;
