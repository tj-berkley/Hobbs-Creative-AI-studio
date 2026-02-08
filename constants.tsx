
import { StudioToolType, ToolDefinition } from './types';

export const HOBBS_AVATAR = "https://files.oaiusercontent.com/file-23oXlXmRntKxM8v6W3UqL7?se=2025-02-21T16%3A31%3A32Z&sp=r&sv=24.12.0&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D4594c348-1854-46c5-a6a3-c5b5974a946c.webp&sig=I2Y9p7Hq7kK6yvY6k%2Ba/vD0qF6jH6k6k6k6k6k6k6k%3D";

export const TOOLS: ToolDefinition[] = [
  {
    id: StudioToolType.CHAT,
    name: 'Hobbs AI',
    description: 'Direct consultation with the visionary mogul of the studio.',
    icon: 'fa-user-tie',
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
    id: StudioToolType.BILLING,
    name: 'Subscription',
    description: 'Manage plan and credits.',
    icon: 'fa-credit-card',
    color: 'emerald'
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
