
import { StudioToolType, ToolDefinition } from './types';

export const TOOLS: ToolDefinition[] = [
  {
    id: StudioToolType.CHAT,
    name: 'Hobbs AI',
    description: 'Direct consultation with the lead strategist of the Studio.',
    icon: 'fa-chess-knight',
    color: 'emerald'
  },
  {
    id: StudioToolType.STORY_ENGINE,
    name: 'Ghostwriter',
    description: 'Multi-genre storyteller and automated script architect.',
    icon: 'fa-pen-nib',
    color: 'emerald'
  },
  {
    id: StudioToolType.MEMORY_NODE,
    name: 'Strategic Recall',
    description: 'Memory node to resume projects and automate social distribution.',
    icon: 'fa-brain-circuit',
    color: 'emerald'
  },
  {
    id: StudioToolType.KNOWLEDGE_BANK,
    name: 'Neural Bank',
    description: 'Upload brand guidelines and files to train your AI brand voice.',
    icon: 'fa-vault',
    color: 'emerald'
  },
  {
    id: StudioToolType.IMAGE_GEN,
    name: 'Hobbs Vision',
    description: 'Pro image generation with elite-tier precision.',
    icon: 'fa-gem',
    color: 'emerald'
  },
  {
    id: StudioToolType.IMAGE_EDIT,
    name: 'Neural Edit',
    description: 'Natural language image manipulation and isolation.',
    icon: 'fa-wand-magic-sparkles',
    color: 'emerald'
  },
  {
    id: StudioToolType.VIDEO_GEN,
    name: 'Hobbs Cinema',
    description: 'Breathtaking video from prompts or images.',
    icon: 'fa-film',
    color: 'emerald'
  },
  {
    id: StudioToolType.VIDEO_EDIT,
    name: 'Motion Morph',
    description: 'Transform or extend videos with natural language.',
    icon: 'fa-clapperboard',
    color: 'emerald'
  },
  {
    id: StudioToolType.MOVIE_STUDIO,
    name: 'Movie Studio',
    description: 'AI character extraction, lipsync scripting, and movie mastering.',
    icon: 'fa-film',
    color: 'emerald'
  },
  {
    id: StudioToolType.SOCIAL_HUB,
    name: 'Box Office',
    description: 'Distribute movies and manage ticket sales revenue.',
    icon: 'fa-ticket',
    color: 'emerald'
  },
  {
    id: StudioToolType.LIVE_VOICE,
    name: 'Voice Lab',
    description: 'Real-time low-latency voice conversations with Hobbs.',
    icon: 'fa-microphone',
    color: 'emerald'
  },
  {
    id: StudioToolType.CONTENT_ANALYSIS,
    name: 'Visual Mind',
    description: 'Deep understanding of images and video context.',
    icon: 'fa-eye',
    color: 'emerald'
  },
  {
    id: StudioToolType.TRANSCRIPTION,
    name: 'Vocal Decode',
    description: 'Precise audio to text with speaker labeling.',
    icon: 'fa-quote-left',
    color: 'emerald'
  },
  {
    id: StudioToolType.BILLING,
    name: 'Treasury',
    description: 'Manage credits and high-yield platform membership.',
    icon: 'fa-credit-card',
    color: 'emerald'
  },
  {
    id: StudioToolType.DEVELOPER,
    name: 'Platform Bridge',
    description: 'Integration tools and external platform connectivity.',
    icon: 'fa-code',
    color: 'emerald'
  }
];

export const MODELS = {
  CHAT_PRO: 'gemini-3-pro-preview',
  CHAT_FLASH: 'gemini-3-flash-preview',
  FAST_LITE: 'gemini-2.5-flash-lite-latest',
  IMAGE_PRO: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image',
  VIDEO_VEO: 'veo-3.1-fast-generate-preview',
  VIDEO_EXTEND: 'veo-3.1-generate-preview',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  MAPS_GROUNDING: 'gemini-2.5-flash'
};

export const REVENUE_LOGIC = {
  PLATFORM_PROFIT_TARGET: 0.80,
  'Nano': {
    platformFee: 0.50,
    costEfficiency: 0.20
  },
  'Studio Pro': {
    platformFee: 0.40,
    costEfficiency: 0.20 // 20% of fee goes to compute, 80% profit
  },
  'Enterprise': {
    platformFee: 0.20,
    costEfficiency: 0.20
  }
};
