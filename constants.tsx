
import { StudioToolType, ToolDefinition } from './types';

export const TOOLS: ToolDefinition[] = [
  {
    id: StudioToolType.CHAT,
    name: 'Intelligent Chat',
    description: 'Advanced reasoning, Google Search, and thinking mode.',
    icon: 'fa-comments',
    color: 'blue'
  },
  {
    id: StudioToolType.IMAGE_GEN,
    name: 'Image Studio',
    description: 'Pro image generation with precision controls.',
    icon: 'fa-image',
    color: 'purple'
  },
  {
    id: StudioToolType.IMAGE_EDIT,
    name: 'Magic Edit',
    description: 'Natural language image manipulation.',
    icon: 'fa-wand-magic-sparkles',
    color: 'pink'
  },
  {
    id: StudioToolType.VIDEO_GEN,
    name: 'Veo Cinema',
    description: 'Breathtaking video from prompts or images.',
    icon: 'fa-film',
    color: 'orange'
  },
  {
    id: StudioToolType.VIDEO_EDIT,
    name: 'Video Morph',
    description: 'Transform or extend videos with natural language.',
    icon: 'fa-clapperboard',
    color: 'rose'
  },
  {
    id: StudioToolType.LIVE_VOICE,
    name: 'Voice Studio',
    description: 'Real-time low-latency voice conversations.',
    icon: 'fa-microphone',
    color: 'green'
  },
  {
    id: StudioToolType.CONTENT_ANALYSIS,
    name: 'Analyzer',
    description: 'Deep understanding of images and video.',
    icon: 'fa-magnifying-glass-chart',
    color: 'indigo'
  },
  {
    id: StudioToolType.TRANSCRIPTION,
    name: 'Transcripter',
    description: 'Precise audio to text transcription.',
    icon: 'fa-quote-left',
    color: 'teal'
  },
  {
    id: StudioToolType.DEVELOPER,
    name: 'Dev Portal',
    description: 'API key management and integrations.',
    icon: 'fa-code',
    color: 'gray'
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
