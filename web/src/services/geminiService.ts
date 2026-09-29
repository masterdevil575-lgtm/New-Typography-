import { Scene, WordItem } from '../types';

export const GeminiService = {
  /**
   * Translates scenes into the target language while proportionally preserving word timing
   */
  async translateScenes(
    scenes: Scene[],
    targetLanguage: string,
    apiKey: string
  ): Promise<Scene[]> {
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please add it in Settings or Onboarding.');
    }

    if (!scenes || scenes.length === 0) return scenes;

    // Build scene texts
    const inputPayload = scenes.map((s, idx) => ({
      index: idx,
      text: s.words.map(w => w.word).join(' '),
    }));

    const prompt = `You are an expert subtitle and typography translator.
Translate the following video caption segments into "${targetLanguage}".
IMPORTANT RULES:
1. Maintain natural conversational rhythm and viral typography punch.
2. Return a valid JSON array of objects with the exact schema:
[
  { "index": 0, "translated": "translated text here" },
  ...
]
3. If the target is "Hinglish", write Hindi using standard English/Latin alphabet.
4. Do not include markdown code blocks or explanations, only raw JSON.

Segments to translate:
${JSON.stringify(inputPayload, null, 2)}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            }
          }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Gemini API error (${response.status})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No translation returned from Gemini.');

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const translatedList: { index: number; translated: string }[] = JSON.parse(cleanJson);

      // Reconstruct scenes with proportionally distributed timestamps
      const newScenes: Scene[] = scenes.map((originalScene, idx) => {
        const match = translatedList.find(t => t.index === idx);
        const translatedText = match ? match.translated.trim() : originalScene.words.map(w => w.word).join(' ');
        const newWords = translatedText.split(/\s+/).filter(Boolean);

        if (newWords.length === 0) return originalScene;

        const duration = Math.max(0.4, originalScene.endTime - originalScene.startTime);
        const timePerWord = duration / newWords.length;

        const updatedWords: WordItem[] = newWords.map((word, wIdx) => {
          const origRef = originalScene.words[Math.min(wIdx, originalScene.words.length - 1)];
          const start = originalScene.startTime + (wIdx * timePerWord);
          const end = originalScene.startTime + ((wIdx + 1) * timePerWord);

          return {
            id: `translated_${idx}_${wIdx}_${Date.now()}`,
            word,
            start,
            end,
            fontSize: origRef?.fontSize || 1,
            isBold: origRef?.isBold ?? true,
            color: origRef?.color,
            highlightColor: origRef?.highlightColor,
          };
        });

        return {
          id: originalScene.id,
          startTime: originalScene.startTime,
          endTime: originalScene.endTime,
          words: updatedWords,
        };
      });

      return newScenes;
    } catch (e: any) {
      console.error('Gemini translation error:', e);
      throw new Error(`Translation failed: ${e.message || 'Unknown error'}`);
    }
  },

  /**
   * Transliterates scenes into Roman Urdu / Roman English (Latin alphabet texting style)
   * while preserving each word's timestamp mapping as closely as possible.
   */
  async transliterateToRomanUrdu(
    scenes: Scene[],
    apiKey: string
  ): Promise<Scene[]> {
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please add it in Settings.');
    }

    if (!scenes || scenes.length === 0) return scenes;

    const inputPayload = scenes.map((s, idx) => ({
      index: idx,
      text: s.words.map(w => w.word).join(' '),
    }));

    const systemInstruction = `You are a specialized Roman Urdu and Roman English caption transliteration engine.
CRITICAL MANDATORY INSTRUCTION: Output must use ONLY Latin/English alphabet characters. Never output Arabic, Urdu (Nastaliq), or Devanagari script under any circumstances. Every single Urdu or Hindi word must be spelled out phonetically using English/Latin alphabet letters in casual everyday texting style (for example: "mera naam hai", NOT "میرا نام ہے", and NOT "मेरा नाम है").`;

    const prompt = `You are an expert in South Asian languages and digital video typography.
Transliterate the following spoken Urdu/Hindi subtitle segments into natural, conversational "Roman Urdu / Roman English" (casual Latin texting script, e.g., "kya haal hai", "bohat zabardast", "aaj hum baat karenge").

CRITICAL MANDATORY RULES:
1. Output must use ONLY Latin/English alphabet characters. Never output Arabic, Urdu (Nastaliq), or Devanagari script under any circumstances.
2. Even if the input is written in Urdu Nastaliq script (like "میرا نام ہے") or Hindi Devanagari (like "मेरा नाम है"), you MUST transliterate every word into English/Latin letters (e.g. "mera naam hai").
3. Do NOT translate Urdu/Hindi words into English vocabulary (e.g., do not turn "shukriya" into "thank you"). Keep the exact spoken Urdu/Hindi words, spelled out in English letters in casual WhatsApp/SMS texting style. If an English word was spoken, keep it in English.
4. Return a valid JSON array of objects with the exact schema:
[
  { "index": 0, "transliterated": "mera naam hai" },
  ...
]
5. Keep word count matching or as close to the original as possible for tight timestamp synchronization.
6. Output raw JSON ONLY without markdown wrapping or backticks.

Segments to transliterate:
${JSON.stringify(inputPayload, null, 2)}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            }
          }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Gemini API error (${response.status})`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No transliteration returned from Gemini.');

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const transliteratedList: { index: number; transliterated: string }[] = JSON.parse(cleanJson);

      const newScenes: Scene[] = scenes.map((originalScene, idx) => {
        const match = transliteratedList.find(t => t.index === idx);
        const rawTransliteration = match ? match.transliterated.trim() : originalScene.words.map(w => w.word).join(' ');
        
        // Enforce strict Latin characters safeguard
        const sanitizedText = sanitizeToStrictLatin(rawTransliteration);
        const newWords = sanitizedText.split(/\s+/).filter(Boolean);

        if (newWords.length === 0) return originalScene;

        const duration = Math.max(0.4, originalScene.endTime - originalScene.startTime);
        const timePerWord = duration / newWords.length;

        const updatedWords: WordItem[] = newWords.map((word, wIdx) => {
          const origRef = originalScene.words[Math.min(wIdx, originalScene.words.length - 1)];
          const start = originalScene.startTime + (wIdx * timePerWord);
          const end = originalScene.startTime + ((wIdx + 1) * timePerWord);

          return {
            id: `roman_${idx}_${wIdx}_${Date.now()}`,
            word,
            start,
            end,
            fontSize: origRef?.fontSize || 1,
            isBold: origRef?.isBold ?? true,
            color: origRef?.color,
            highlightColor: origRef?.highlightColor,
          };
        });

        return {
          id: originalScene.id,
          startTime: originalScene.startTime,
          endTime: originalScene.endTime,
          words: updatedWords,
        };
      });

      return newScenes;
    } catch (e: any) {
      console.error('Gemini transliteration error:', e);
      throw new Error(`Transliteration failed: ${e.message || 'Unknown error'}`);
    }
  }
};

/**
 * Fallback sanitizer guaranteeing that NO Arabic, Urdu Nastaliq, or Devanagari script
 * characters ever pass through into Roman Urdu/English captions.
 */
function sanitizeToStrictLatin(input: string): string {
  if (!input) return '';

  // Common Urdu/Arabic to Latin character mapping fallback
  const urduToLatinMap: Record<string, string> = {
    'ا': 'a', 'آ': 'aa', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'd', 'ذ': 'z',
    'ر': 'r', 'ڑ': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'و': 'o',
    'ہ': 'h', 'ھ': 'h', 'ء': '', 'ی': 'i', 'ے': 'e',
  };

  // Common Devanagari to Latin character mapping fallback
  const hindiToLatinMap: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', '्': '',
  };

  let result = '';
  for (const char of input) {
    if (urduToLatinMap[char] !== undefined) {
      result += urduToLatinMap[char];
    } else if (hindiToLatinMap[char] !== undefined) {
      result += hindiToLatinMap[char];
    } else {
      result += char;
    }
  }

  // Strip any remaining non-Latin, non-number, non-basic punctuation characters
  result = result.replace(/[^\w\s.,!?'"-\/]/g, '').trim();

  return result || input;
}
