export interface WordItem {
  id: string;
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  fontSize?: number; // relative scaling factor (default 1)
  color?: string;
  highlightColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUppercase?: boolean;
  hasBackgroundBox?: boolean;
  boxColor?: string;
}

export interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  words: WordItem[];
}

export type AnimationType = 
  | 'karaoke-fill' 
  | 'viral-split' 
  | 'cinematic-reveal' 
  | 'huge-punch'
  | 'desi-vibes'
  | 'trending-pk'
  | 'vlog-pop'
  | 'qawwali-beat';

export interface TypographyStyle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  font: string;
  primaryColor: string;
  highlightColor: string;
  secondaryColor?: string;
  animationType: AnimationType;
  boxBackground?: string;
  badge: string;
}

export interface ProjectBackground {
  type: 'color' | 'gradient' | 'media' | 'auto';
  value: string;
  mediaBlobKey?: string;
  mediaType?: 'image' | 'video';
}

export interface Project {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  duration: number;
  audioBlobKey: string;
  audioUrl?: string;
  styleId: string;
  scenes: Scene[];
  background: ProjectBackground;
  mode: 'kinetic' | 'autocaptions';
  language: string;
  sfxEnabled?: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
  isTransliterationTarget?: boolean;
}

export interface UserSettings {
  groqApiKey: string;
  geminiApiKey: string;
  defaultLanguage: string;
  defaultExportQuality: '720p' | '1080p';
  hasCompletedOnboarding: boolean;
  sfxEnabled: boolean;
}
