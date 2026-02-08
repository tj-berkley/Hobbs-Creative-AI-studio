
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODELS } from "../constants";

export interface TranscriptionConfig {
  language: string;
  dialectDetails?: string;
  domain: string;
  speakerCount: string;
  speakerNames?: string;
  cleanFillers: boolean;
  enableDiarization: boolean;
  keywords?: string;
  acousticEnvironment?: string; // New field for accuracy
}

export class GeminiService {
  private static getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async chat(message: string, options: { useThinking?: boolean; useSearch?: boolean; useMaps?: boolean } = {}) {
    const ai = this.getAI();
    const config: any = {};
    
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

    return await ai.models.generateContent({
      model,
      contents: message,
      config
    });
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

  static async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16', base64Image?: string) {
    const ai = this.getAI();
    
    const params: any = {
      model: MODELS.VIDEO_VEO,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
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
      Task: Perform ultra-high-fidelity audio transcription with expert-level linguistic accuracy.
      
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
      
      Execution Directives: 
      1. Calibrate your phoneme recognition based on the "Regional Dialect" and "Acoustic Environment" hints to minimize errors in accented speech or noisy environments.
      2. If Diarization is Enabled, identify unique vocal signatures and label them consistently throughout the session.
      3. Use industry-standard terminology based on the "Semantic Industry Domain".
      4. Return ONLY the finalized, formatted transcription text.
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
    referenceAudio?: { data: string, mimeType: string } 
  }) {
    const ai = this.getAI();
    const parts: any[] = [];

    if (options.referenceAudio) {
      parts.push({
        inlineData: {
          data: options.referenceAudio.data,
          mimeType: options.referenceAudio.mimeType
        }
      });
      parts.push({
        text: `Analyze the speaker's voice in the provided audio sample. Then, speak the following text in that EXACT same voice, tone, and inflection: "${text}"`
      });
    } else {
      parts.push({ text });
    }

    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts }],
      config: {
        responseModalities: [Modality.AUDIO],
        // Fix: pitch and speakingRate are not valid properties of VoiceConfig in the current SDK
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
