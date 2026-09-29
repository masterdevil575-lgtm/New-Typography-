import { Scene, WordItem } from '../types';

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
  words?: WhisperWord[];
}

export interface WhisperVerboseResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  words?: WhisperWord[];
  segments?: WhisperSegment[];
}

export const GroqService = {
  /**
   * Verifies if the provided Groq API key is valid
   */
  async verifyApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      return { valid: false, message: 'Please enter a valid Groq API key.' };
    }
    if (!trimmed.startsWith('gsk_')) {
      return { valid: false, message: 'Groq API keys usually start with "gsk_". Please check your key.' };
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${trimmed}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        return { valid: true, message: 'Key verified successfully!' };
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.error?.message || `HTTP ${res.status}: Invalid API Key`;
        return { valid: false, message: msg };
      }
    } catch (e: any) {
      return { valid: false, message: e.message || 'Network error verifying key. Check connection.' };
    }
  },

  /**
   * Transcribes an audio/video file using Groq Whisper large-v3-turbo with word timestamps
   */
  async transcribeAudio(
    audioBlob: Blob,
    fileName: string,
    apiKey: string,
    language: string,
    onProgress?: (status: string) => void
  ): Promise<{ scenes: Scene[]; rawText: string; duration: number }> {
    onProgress?.('Preparing audio for transcription...');

    if (!apiKey) {
      throw new Error('Groq API Key is missing. Please set your key in Settings or Onboarding.');
    }

    const formData = new FormData();
    const cleanFileName = fileName.replace(/[^\w.-]/gi, '_') || 'audio.mp3';
    formData.append('file', audioBlob, cleanFileName);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    // Language handling
    if (language && language !== 'auto' && language !== 'hinglish') {
      formData.append('language', language);
    }

    if (language === 'hinglish') {
      formData.append('prompt', 'Transcribe in Hinglish Roman English script: Namaste, kya haal hai, ye video viral hoga.');
    }

    onProgress?.('Uploading to Groq Whisper Large v3 Turbo...');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const errorMsg = err?.error?.message || `Groq Whisper failed (Status: ${response.status})`;
      throw new Error(errorMsg);
    }

    onProgress?.('Processing word timestamps and scenes...');
    const result: WhisperVerboseResponse = await response.json();

    return this.parseWhisperResponse(result);
  },

  /**
   * Converts Whisper word-level timestamps and segments into Scene objects
   */
  parseWhisperResponse(result: WhisperVerboseResponse): { scenes: Scene[]; rawText: string; duration: number } {
    const rawText = result.text || '';
    const duration = result.duration || 0;
    const scenes: Scene[] = [];

    // If segments with words are available:
    if (result.segments && result.segments.length > 0) {
      result.segments.forEach((seg, sIdx) => {
        const wordsList: WordItem[] = [];

        if (seg.words && seg.words.length > 0) {
          seg.words.forEach((w, wIdx) => {
            wordsList.push({
              id: `word_${sIdx}_${wIdx}_${Date.now()}`,
              word: w.word.trim(),
              start: Math.max(0, w.start),
              end: Math.max(w.start + 0.1, w.end),
              fontSize: 1,
              isBold: true,
            });
          });
        } else {
          // Fallback if segment didn't break down words
          const split = seg.text.trim().split(/\s+/);
          const segDuration = Math.max(0.5, seg.end - seg.start);
          const perWord = segDuration / Math.max(1, split.length);
          split.forEach((sw, swIdx) => {
            wordsList.push({
              id: `word_fallback_${sIdx}_${swIdx}`,
              word: sw,
              start: seg.start + (swIdx * perWord),
              end: seg.start + ((swIdx + 1) * perWord),
              fontSize: 1,
              isBold: true,
            });
          });
        }

        if (wordsList.length > 0) {
          scenes.push({
            id: `scene_${sIdx}`,
            startTime: wordsList[0].start,
            endTime: wordsList[wordsList.length - 1].end,
            words: wordsList,
          });
        }
      });
    } else if (result.words && result.words.length > 0) {
      // Direct words list: group every 4-6 words into a scene
      const WORDS_PER_SCENE = 4;
      for (let i = 0; i < result.words.length; i += WORDS_PER_SCENE) {
        const chunk = result.words.slice(i, i + WORDS_PER_SCENE);
        const wordsList: WordItem[] = chunk.map((w, wIdx) => ({
          id: `word_${i + wIdx}_${Date.now()}`,
          word: w.word.trim(),
          start: Math.max(0, w.start),
          end: Math.max(w.start + 0.1, w.end),
          fontSize: 1,
          isBold: true,
        }));

        scenes.push({
          id: `scene_${Math.floor(i / WORDS_PER_SCENE)}`,
          startTime: wordsList[0].start,
          endTime: wordsList[wordsList.length - 1].end,
          words: wordsList,
        });
      }
    } else {
      // Synthetic scenes based on text split
      const words = rawText.split(/\s+/).filter(Boolean);
      const estDuration = Math.max(duration, words.length * 0.4);
      const WORDS_PER_SCENE = 4;
      const timePerWord = estDuration / Math.max(1, words.length);

      for (let i = 0; i < words.length; i += WORDS_PER_SCENE) {
        const chunk = words.slice(i, i + WORDS_PER_SCENE);
        const wordsList: WordItem[] = chunk.map((w, idx) => {
          const globalIdx = i + idx;
          return {
            id: `word_synth_${globalIdx}`,
            word: w,
            start: globalIdx * timePerWord,
            end: (globalIdx + 1) * timePerWord,
            fontSize: 1,
            isBold: true,
          };
        });

        scenes.push({
          id: `scene_synth_${i}`,
          startTime: wordsList[0].start,
          endTime: wordsList[wordsList.length - 1].end,
          words: wordsList,
        });
      }
    }

    return {
      scenes,
      rawText,
      duration: scenes.length > 0 ? scenes[scenes.length - 1].endTime : duration,
    };
  },

  /**
   * Generates realistic demo captions for instant testing without requiring an API key
   */
  generateDemoScenes(audioType: 'motivation' | 'podcast'): { scenes: Scene[]; rawText: string; duration: number } {
    if (audioType === 'motivation') {
      const demoWords = [
        { word: 'DO', start: 0.1, end: 0.4 },
        { word: 'SOMETHING', start: 0.45, end: 0.9 },
        { word: 'TODAY', start: 0.95, end: 1.3 },
        { word: 'THAT', start: 1.35, end: 1.6 },
        { word: 'YOUR', start: 1.65, end: 1.9 },
        { word: 'FUTURE', start: 1.95, end: 2.35 },
        { word: 'SELF', start: 2.4, end: 2.8 },
        { word: 'WILL', start: 2.85, end: 3.1 },
        { word: 'THANK', start: 3.15, end: 3.55 },
        { word: 'YOU', start: 3.6, end: 3.9 },
        { word: 'FOR.', start: 3.95, end: 4.4 },
      ];

      return {
        rawText: 'DO SOMETHING TODAY THAT YOUR FUTURE SELF WILL THANK YOU FOR.',
        duration: 4.6,
        scenes: [
          {
            id: 'scene_demo_1',
            startTime: 0.1,
            endTime: 1.3,
            words: demoWords.slice(0, 3).map((w, i) => ({ id: `d1_${i}`, ...w, isBold: true, fontSize: 1 })),
          },
          {
            id: 'scene_demo_2',
            startTime: 1.35,
            endTime: 2.8,
            words: demoWords.slice(3, 7).map((w, i) => ({ id: `d2_${i}`, ...w, isBold: true, fontSize: 1.1 })),
          },
          {
            id: 'scene_demo_3',
            startTime: 2.85,
            endTime: 4.4,
            words: demoWords.slice(7).map((w, i) => ({ id: `d3_${i}`, ...w, isBold: true, fontSize: 1.2 })),
          },
        ],
      };
    } else {
      const demoWords = [
        { word: 'NextGen', start: 0.2, end: 0.65 },
        { word: 'Kinetic', start: 0.7, end: 1.15 },
        { word: 'turns', start: 1.2, end: 1.5 },
        { word: 'your', start: 1.55, end: 1.8 },
        { word: 'voice', start: 1.85, end: 2.2 },
        { word: 'into', start: 2.25, end: 2.55 },
        { word: 'viral', start: 2.6, end: 2.95 },
        { word: 'motion', start: 3.0, end: 3.4 },
        { word: 'typography!', start: 3.45, end: 4.2 },
      ];

      return {
        rawText: 'NextGen Kinetic turns your voice into viral motion typography!',
        duration: 4.5,
        scenes: [
          {
            id: 'scene_p1',
            startTime: 0.2,
            endTime: 1.8,
            words: demoWords.slice(0, 4).map((w, i) => ({ id: `dp1_${i}`, ...w, isBold: true, fontSize: 1 })),
          },
          {
            id: 'scene_p2',
            startTime: 1.85,
            endTime: 4.2,
            words: demoWords.slice(4).map((w, i) => ({ id: `dp2_${i}`, ...w, isBold: true, fontSize: 1.15 })),
          },
        ],
      };
    }
  }
};
