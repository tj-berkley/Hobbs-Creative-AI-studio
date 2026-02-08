
import { StudioToolType, ToolDefinition } from './types';

export const TOOLS: ToolDefinition[] = [
  {
    id: StudioToolType.CHAT,
    name: 'Sam AI',
    description: 'Direct consultation with the Strategic Knight of the Klub.',
    icon: 'fa-chess-knight',
    color: 'emerald'
  },
  {
    id: StudioToolType.IMAGE_GEN,
    name: 'Klub Studio',
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
    name: 'Klub Cinema',
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
    id: StudioToolType.LIVE_VOICE,
    name: 'Vocal Lab',
    description: 'Real-time low-latency voice conversations with Sam.',
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
    name: 'Diarization',
    description: 'Precise audio to text with speaker labeling.',
    icon: 'fa-quote-left',
    color: 'emerald'
  },
  {
    id: StudioToolType.BILLING,
    name: 'Bank',
    description: 'Manage credits and Klub membership.',
    icon: 'fa-credit-card',
    color: 'emerald'
  },
  {
    id: StudioToolType.DEVELOPER,
    name: 'API Bridge',
    description: 'Developer integration and bridge management.',
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
