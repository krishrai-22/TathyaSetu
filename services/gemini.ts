import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { AnalysisResult, FullAnalysisResponse, GroundingSource, VerdictType, Language, NewsItem } from "../types";

// Initialize the API client
// CRITICAL: process.env.API_KEY is guaranteed to be available in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

// Helper to convert file to Base64
const fileToPart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  text: string, 
  file: File | null, 
  url: string | null = null,
  language: Language = 'en'
): Promise<FullAnalysisResponse> => {
  if ((!text || text.trim().length === 0) && !file && !url) {
    throw new Error("Please enter text, a URL, or upload media to analyze.");
  }

  const languageInstruction = getLanguageName(language);

  // HIGHLY OPTIMIZED PROMPT FOR SPEED (<3s)
  const promptText = `
    Analyze for misinformation. Output JSON in ${languageInstruction}.
    
    Context:
    Text: "${text}"
    URL: "${url || 'None'}"

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

  const parts: any[] = [];
  
  if (file) {
    const mediaPart = await fileToPart(file);
    parts.push(mediaPart);
  }
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: parts, // Pass array of parts (text + optional media)
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

    // Filter out duplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      result,
      sources: uniqueSources,
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze content. Please try again.");
  }
};

export const fetchTrendingNews = async (
  language: Language, 
  category: string = 'Trending',
  count: number = 4
): Promise<NewsItem[]> => {
  let region = "Global";
  // For any Indian language, prioritize Indian news
  if (language !== 'en') {
    region = "India";
  } else if (category === 'India') {
    region = "India";
  }
  
  const langName = getLanguageName(language);

  // Construct a concise query to hit Google News directly for speed
  const query = `site:news.google.com "${category}" news ${region} when:24h`;

  // Extremely streamlined prompt for speed (<2s goal)
  const prompt = `
    Find ${count} "news.google.com" links for "${category}" news in ${region}.
    Prefer articles in ${langName} if available, otherwise English.
    
    JSON Output:
    [{"title": "Str", "snippet": "Short str", "source": "Publisher", "url": "https://news.google.com/...", "publishedTime": "Str"}]
    
    If no direct article link, use: https://news.google.com/search?q={title}
  `;

  try {
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
      // Client-side fallback to ensure 100% compliance with Google News URL rule
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
  let instruction = `You are a friendly and expert AI assistant specializing in media literacy, fact-checking, and misinformation detection. You explain complex concepts simply. Keep your answers concise and helpful. Reply in ${langName}.`;
  
  let contextPrompt = "";
  if (context) {
    contextPrompt = `
      The user is asking questions about a specific analysis you just performed.
      Here is the context of that analysis:
      Verdict: ${context.verdict}
      Summary: ${context.summary}
      Detailed Analysis: ${context.detailedAnalysis}
      
      Please answer the user's follow-up questions based on this context.
    `;
  }

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: instruction + contextPrompt,
    }
  });
};

export const streamAudio = async function* (text: string, language: Language = 'en'): AsyncGenerator<Uint8Array, void, unknown> {
  const ttsModel = "gemini-2.5-flash-preview-tts";
  
  // Use 'Puck' as a consistent voice. 
  const voiceName = 'Puck';

  try {
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
    Translate the values of the following JSON object into ${targetLangName}.
    Maintain the JSON structure exactly. Do not translate keys (like 'verdict', 'confidence').
    Only translate the string values for 'summary', 'detailedAnalysis', and the items in the 'keyPoints' array.
    
    JSON to translate:
    ${JSON.stringify(result)}
  `;

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