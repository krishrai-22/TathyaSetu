import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { AnalysisResult, FullAnalysisResponse, GroundingSource, VerdictType, Language, NewsItem } from "../types";

// Switch to Flash model for faster (<5s) response times
const modelId = "gemini-3-flash-preview";

const getLanguageName = (lang: Language): string => {
  const map: Record<Language, string> = {
    en: "English",
    hi: "Hindi",
    hinglish: "Hinglish",
    bn: "Bengali",
    te: "Telugu",
    mr: "Marathi",
    ta: "Tamil",
    ur: "Urdu",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi"
  };
  return map[lang] || "English";
};

// Helper to convert File to GenerativePart
async function fileToPart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// PCM Decoding for TTS
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM to AudioBuffer
export async function pcmToAudioBuffer(
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

export const analyzeContent = async (
  input: string | File | { type: 'url'; value: string }, 
  language: Language = 'en'
): Promise<FullAnalysisResponse> => {
  
  const languageInstruction = getLanguageName(language);
  let promptText = `
    Analyze for misinformation. Output JSON in ${languageInstruction}.
    Instructions:
    1. Use googleSearch to verify.
    2. Be EXTREMELY CONCISE.
    3. Output Schema:
       - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
       - confidence: 0-100
       - summary: ONE short sentence.
       - detailedAnalysis: Max 2 sentences explaining why.
       - keyPoints: Array of max 3 short bullet points.
  `;
  
  let contentParts: any[] = [];

  if (typeof input === 'string') {
    if (!input.trim()) throw new Error("Please enter text to analyze.");
    contentParts = [
      { text: `Context:\nText: "${input}"\n\n` + promptText }
    ];
  } else if (input instanceof File) {
    const filePart = await fileToPart(input);
    contentParts = [
      filePart,
      { text: `Analyze this media (image/audio/video) for misinformation. ` + promptText }
    ];
  } else if (typeof input === 'object' && input.type === 'url') {
    // For URLs, we rely on Google Search grounding to find info about the link
    contentParts = [
      { text: `Verify the credibility of this link: "${input.value}". ` + promptText }
    ];
  }

  try {
    // Initialize inside function to avoid startup crash if key is missing
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: contentParts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: Object.values(VerdictType) },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["verdict", "confidence", "summary", "detailedAnalysis", "keyPoints"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No analysis generated.");
    }

    const result: AnalysisResult = JSON.parse(jsonText);

    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri,
          });
        }
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      result,
      sources: uniqueSources,
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.status === 429 || error.code === 429 || error.message?.includes('429')) {
         throw new Error("Quota exceeded (429). The free tier limit has been reached. Please try again in a few minutes.");
    }
    throw new Error(error.message || "Failed to analyze content. Please try again.");
  }
};

export const fetchTrendingNews = async (
  language: Language, 
  category: string = 'Trending',
  count: number = 4
): Promise<NewsItem[]> => {
  let region = "Global";
  if (language !== 'en') {
    region = "India";
  } else if (category === 'India') {
    region = "India";
  }
  
  const langName = getLanguageName(language);
  
  const prompt = `
    Find ${count} "news.google.com" links for "${category}" news in ${region}.
    Prefer articles in ${langName} if available, otherwise English.
    
    JSON Output:
    [{"title": "Str", "snippet": "Short str", "source": "Publisher", "url": "https://news.google.com/...", "publishedTime": "Str"}]
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      const items = JSON.parse(response.text) as NewsItem[];
      return items.map(item => ({
        ...item,
        url: item.url?.includes('news.google.com') 
             ? item.url 
             : `https://news.google.com/search?q=${encodeURIComponent(item.title)}`
      }));
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch news", e);
    return [];
  }
};

export const createChatSession = (language: Language = 'en', context?: AnalysisResult): Chat => {
  const langName = getLanguageName(language);
  let instruction = `You are a friendly and expert AI assistant specializing in media literacy. Reply in ${langName}.`;
  
  let contextPrompt = "";
  if (context) {
    contextPrompt = `
      Context of previous analysis:
      Verdict: ${context.verdict}
      Summary: ${context.summary}
      Detailed Analysis: ${context.detailedAnalysis}
    `;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: instruction + contextPrompt,
    }
  });
};

export const streamAudio = async function* (text: string, language: Language = 'en'): AsyncGenerator<Uint8Array, void, unknown> {
  const ttsModel = "gemini-2.5-flash-preview-tts";
  const voiceName = 'Puck';

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: ttsModel,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      yield decode(base64Audio);
    }
  } catch (e) {
    console.error("Gemini TTS Generation Error", e);
    throw e;
  }
};

export const translateAnalysis = async (
  result: AnalysisResult, 
  targetLanguage: Language
): Promise<AnalysisResult> => {
  const modelId = "gemini-3-flash-preview";
  const targetLangName = getLanguageName(targetLanguage);

  const prompt = `
    Translate values to ${targetLangName}. Maintain JSON structure.
    JSON: ${JSON.stringify(result)}
  `;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: Object.values(VerdictType) },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            detailedAnalysis: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["verdict", "confidence", "summary", "detailedAnalysis", "keyPoints"],
        },
    }
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Translation failed");
  
  return JSON.parse(jsonText);
};