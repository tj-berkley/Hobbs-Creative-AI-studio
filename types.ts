
export enum StudioToolType {
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIDEO_GEN = 'VIDEO_GEN',
  VIDEO_EDIT = 'VIDEO_EDIT',
  LIVE_VOICE = 'LIVE_VOICE',
  CONTENT_ANALYSIS = 'CONTENT_ANALYSIS',
  TRANSCRIPTION = 'TRANSCRIPTION',
  DEVELOPER = 'DEVELOPER'
}

export interface ToolDefinition {
  id: StudioToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
  groundingMetadata?: any;
  timestamp: number;
}

export interface ImageResult {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface VideoResult {
  url: string;
  prompt: string;
  timestamp: number;
}
