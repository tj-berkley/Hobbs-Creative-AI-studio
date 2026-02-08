
export enum StudioToolType {
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIDEO_GEN = 'VIDEO_GEN',
  VIDEO_EDIT = 'VIDEO_EDIT',
  LIVE_VOICE = 'LIVE_VOICE',
  CONTENT_ANALYSIS = 'CONTENT_ANALYSIS',
  TRANSCRIPTION = 'TRANSCRIPTION',
  DEVELOPER = 'DEVELOPER',
  BILLING = 'BILLING',
  SOCIAL_HUB = 'SOCIAL_HUB',
  MOVIE_STUDIO = 'MOVIE_STUDIO',
  MEMORY_NODE = 'MEMORY_NODE',
  KNOWLEDGE_BANK = 'KNOWLEDGE_BANK',
  STORY_ENGINE = 'STORY_ENGINE'
}

export type StoryGenre = 
  | 'Non-Fiction' 
  | 'Fiction' 
  | 'Storyteller' 
  | 'Scary Nights' 
  | 'Comedy' 
  | 'Drama' 
  | 'Action' 
  | 'Thriller' 
  | 'Children\'s Book';

export interface ScriptScene {
  id: string;
  order: number;
  setting: string;
  actionPrompt: string;
  visualDirective: string;
  dialogue: string;
  estimatedDuration: number;
  directorSuggestions: string; // New: Ideas for the director to improve the scene
  engagementTriggers: string; // New: Strategies to keep watchers hooked
  generatedVideoUrl?: string;
  isGenerating?: boolean;
}

export interface ScriptProject {
  id: string;
  title: string;
  genre: StoryGenre;
  premise: string;
  fullStory: string;
  scenes: ScriptScene[];
}

export interface PlatformConfig {
  name: string;
  brandColor: string;
  logoIcon: string;
  enabledTools: StudioToolType[];
  subdomain: string;
  isDeployed: boolean;
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

export interface PersonalityProfile {
  voiceTimbre: string;
  emotionalBaseline: string;
  commonActions: string[];
  vocalQuirks: string[];
  summary: string;
}

export interface MovieReview {
  id: string;
  username: string;
  rating: number;
  comment: string;
  watchTime: number; // in seconds
  completed: boolean;
}

export interface MovieAnalytics {
  ticketsSold: number;
  revenue: number;
  avgWatchTime: number;
  completionRate: number;
  avgRating: number;
  dropOffPoint: number; // second where most users leave
  reviews: MovieReview[];
}

export interface MovieClip {
  id: string;
  url: string;
  name: string;
  duration: number;
  thumbnail: string;
  startTime?: number;
  endTime?: number;
  personality?: PersonalityProfile;
  lipsyncScript?: string;
  isTicketed?: boolean;
  ticketPrice?: number;
  analytics?: MovieAnalytics;
}

export interface UserCredits {
  balance: number;
  tier: 'Nano' | 'Studio Pro' | 'Enterprise';
}

export interface BoxOfficeStats {
  totalTicketsSold: number;
  revenueGross: number;
  platformSplit: number;
  userProfit: number;
}

export interface ScheduledPost {
  id: string;
  platform: string;
  title: string;
  content: string;
  scheduledTime: string;
  status: 'pending' | 'processing' | 'live';
  mediaUrls?: string[];
  videoTrim?: { start: number, end: number };
  isTicketed?: boolean;
  ticketPrice?: number;
}

export interface SocialPostPrefill {
  mediaUrl: string;
  title: string;
  type: 'video' | 'image';
}

export interface KnowledgeEntry {
  id: string;
  fileName: string;
  fileType: string;
  contentSummary: string;
  addedAt: number;
  status: 'indexed' | 'processing';
}

export interface ProjectState {
  lastTool: StudioToolType;
  movieTimeline: MovieClip[];
  lastUpdate: number;
}
