
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODELS } from "../constants";
import { StoryGenre } from "../types";

export interface TranscriptionConfig {
  language: string;
  dialectDetails?: string;
  domain: string;
  speakerCount: string;
  speakerNames?: string;
  cleanFillers: boolean;
  enableDiarization: boolean;
  keywords?: string;
  acousticEnvironment?: string;
}

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async chat(message: string, options: { useThinking?: boolean; useSearch?: boolean; useMaps?: boolean } = {}) {
    const ai = this.getAI();
    const config: any = {
      systemInstruction: "You are Hobbs, the lead Strategic Consultant and creative mastermind behind Hobbs Studio. You are highly intelligent, decisive, and speak with a focus on creative strategy, elite execution, and high-performance design. You provide sharp, efficient, and professional guidance. You are the user's primary intelligence partner."
    };
    
    if (options.useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    if (options.useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    if (options.useMaps) {
      config.tools = [{ googleMaps: {} }];
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: 37.7749, longitude: -122.4194 }
        }
      };
    }

    const model = options.useMaps ? MODELS.MAPS_GROUNDING : (options.useSearch ? MODELS.CHAT_FLASH : MODELS.CHAT_PRO);

    const response = await ai.models.generateContent({
      model,
      contents: message,
      config
    });
    return response;
  }

  static async generateStory(genre: StoryGenre, premise: string) {
    const ai = this.getAI();
    const prompt = `Write a compelling and highly detailed ${genre} story based on this premise: "${premise}". 
    The story should be structured as a professional literary work suitable for publication and sale.
    Focus on creating a unique "world-feel" for the genre. Ensure rich descriptions and immersive world-building.`;

    const response = await ai.models.generateContent({
      model: MODELS.CHAT_PRO,
      contents: prompt
    });
    return response.text;
  }

  static async convertStoryToScript(story: string, genre: StoryGenre) {
    const ai = this.getAI();
    const prompt = `Convert the following ${genre} story into a professional, scene-by-scene movie script for a high-end cinematic production. 
    Break the story down into exactly 5-8 distinct scenes. 
    For each scene, provide:
    1. Setting (EXT/INT location)
    2. A detailed Visual Directive (for an AI video generator like Veo)
    3. The Action Prompt (what happens in the scene)
    4. Key Dialogue
    5. Estimated duration in seconds (between 5 and 10).
    6. Director Suggestions: Professional ideas for camera angles, lighting shifts, or specific visual effects to improve scene impact.
    7. Engagement Triggers: Strategic narrative or visual hooks to maximize watcher retention.
    
    Story: ${story}
    
    Return the result as a JSON array of objects.`;

    const response = await ai.models.generateContent({
      model: MODELS.CHAT_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              setting: { type: Type.STRING },
              visualDirective: { type: Type.STRING },
              actionPrompt: { type: Type.STRING },
              dialogue: { type: Type.STRING },
              estimatedDuration: { type: Type.NUMBER },
              directorSuggestions: { type: Type.STRING },
              engagementTriggers: { type: Type.STRING }
            },
            required: ["setting", "visualDirective", "actionPrompt", "dialogue", "estimatedDuration", "directorSuggestions", "engagementTriggers"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  static async analyzeCharacter(base64Video: string, mimeType: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.CHAT_PRO,
      contents: {
        parts: [
          { inlineData: { data: base64Video, mimeType } },
          { text: "Analyze the person in this video with ultra-high precision. Extract their 'Personality Fingerprint'. Detail their voice timbre (warmth, frequency, pitch), their emotional baseline, recurring actions/gestures, and unique vocal quirks. Return the result in a JSON-like structure with fields: voiceTimbre, emotionalBaseline, commonActions (array), vocalQuirks (array), summary." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            voiceTimbre: { type: Type.STRING },
            emotionalBaseline: { type: Type.STRING },
            commonActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            vocalQuirks: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  }

  static async generateMovieScript(characters: any[]) {
    const ai = this.getAI();
    const prompt = `Act as an elite Hollywood Scriptwriter. Based on the following character fingerprints extracted from video clips, write a short, compelling dialogue script for a scene involving these characters. 
    Characters: ${JSON.stringify(characters)}
    Return a JSON array where each object has "index" (clip index) and "dialogue" (the line of text they should speak).`;

    const response = await ai.models.generateContent({
      model: MODELS.CHAT_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.NUMBER },
              dialogue: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  }

  static async generateImage(prompt: string, config: { aspectRatio: string, imageSize: string }) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_PRO,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.imageSize
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }

  static async editImage(base64Image: string, prompt: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image edit failed");
  }

  static async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16', base64Image?: string, resolution: '720p' | '1080p' = '720p') {
    const ai = this.getAI();
    
    const params: any = {
      model: MODELS.VIDEO_VEO,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio
      }
    };

    if (base64Image) {
      params.image = {
        imageBytes: base64Image,
        mimeType: 'image/png'
      };
    }

    let operation = await ai.models.generateVideos(params);
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  static async analyzeMedia(file: { data: string, mimeType: string }, prompt: string) {
    const ai = this.getAI();
    return await ai.models.generateContent({
      model: MODELS.CHAT_PRO,
      contents: {
        parts: [
          { inlineData: { data: file.data, mimeType: file.mimeType } },
          { text: prompt }
        ]
      }
    });
  }

  static async transcribeAudio(base64Audio: string, config: TranscriptionConfig) {
    const ai = this.getAI();
    
    const instructions = `
      Task: Perform ultra-high-fidelity audio transcription with expert-level linguistic accuracy for Hobbs Studio.
      
      Linguistic Engine Calibration:
      - Primary Language: ${config.language}
      - Regional Dialect/Accent: ${config.dialectDetails || 'Standard/Neutral'}
      - Semantic Industry Domain: ${config.domain}
      - Acoustic Environment: ${config.acousticEnvironment || 'General Recording'}
      
      Participant Map:
      - Map detected speakers to these names if provided: ${config.speakerNames || 'Anonymous (use [Speaker N] tags)'}
      - Expected Speaker Count: ${config.speakerCount}
      
      Speech Logic:
      - Diarization: ${config.enableDiarization ? 'Enabled' : 'Disabled'}
      - Content Mode: ${config.cleanFillers ? 'Clean Read (Remove um/uh)' : 'Verbatim (Raw Utterances)'}
      ${config.keywords ? `- Critical Technical Terminology: ${config.keywords}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: MODELS.CHAT_FLASH,
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
          { text: instructions }
        ]
      }
    });
    return response.text;
  }

  static async generateTTS(text: string, options: { 
    voiceName?: string, 
    pitch?: number, 
    speakingRate?: number,
    emotion?: string,
    timbre?: string,
    reverb?: number,
    echo?: number,
    delay?: number,
    emotionIntensity?: number,
    referenceAudio?: { data: string, mimeType: string } 
  }) {
    const ai = this.getAI();
    const parts: any[] = [];

    const intensity = options.emotionIntensity || 100;
    const emotionDesc = options.emotion && options.emotion !== 'Neutral' 
      ? `Deliver the performance with an extremely ${options.emotion} emotional state (Intensity: ${intensity}%). Adjust vocal inflections, breathiness, and pitch variance to embody this sentiment fully.` 
      : '';

    const reverbDesc = options.reverb && options.reverb > 10 ? `Apply a ${options.reverb}% intensity wet reverb, sounding like a ${options.reverb > 70 ? 'vast hall' : options.reverb > 40 ? 'large room' : 'small chamber'}.` : '';
    const echoDesc = options.echo && options.echo > 10 ? `Add a distinct slapback echo with ${options.echo}% intensity.` : '';
    const delayDesc = options.delay && options.delay > 10 ? `Apply a feedback delay effect at ${options.delay}% intensity.` : '';

    const styleDirectives = [
      emotionDesc,
      options.timbre ? `Acoustic Directive: Apply a ${options.timbre} vocal timbre characteristic to the output.` : '',
      reverbDesc,
      echoDesc,
      delayDesc,
      options.speakingRate ? `Tempo: Speak at a ${options.speakingRate > 1.2 ? 'fast' : options.speakingRate < 0.8 ? 'slow' : 'normal'} pace.` : '',
      options.pitch ? `Pitch Mapping: Speak with a ${options.pitch > 1.2 ? 'high-pitched' : options.pitch < 0.8 ? 'deep, low-pitched' : 'natural'} voice.` : ''
    ].filter(Boolean).join(' ');

    if (options.referenceAudio) {
      parts.push({
        inlineData: {
          data: options.referenceAudio.data,
          mimeType: options.referenceAudio.mimeType
        }
      });
      parts.push({
        text: `Zero-Shot Voice Cloning Directive: Analyze the speaker's voice in the provided reference audio. Synthesize the following text using THAT EXACT voice: "${text}". Apply these stylistic overrides for a professional cinematic performance: ${styleDirectives}. Ensure the character's essence is preserved while adopting the requested emotional texture.`
      });
    } else {
      parts.push({ 
        text: `Style Directive: ${styleDirectives} Synthesize text with high-fidelity: "${text}"`
      });
    }

    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: options.referenceAudio ? undefined : {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: options.voiceName || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated from TTS model.");
    return base64Audio;
  }
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
