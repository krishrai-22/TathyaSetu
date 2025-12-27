import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Load env vars from root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Critical: Twilio sends data as 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, PORT } = process.env;

if (!API_KEY || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error("❌ Missing Environment Variables: Ensure API_KEY, TWILIO_ACCOUNT_SID, and TWILIO_AUTH_TOKEN are set in .env");
  process.exit(1);
}

// Initialize Clients
const ai = new GoogleGenAI({ apiKey: API_KEY });
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const modelId = "gemini-3-flash-preview";

app.post('/webhook', (req, res) => {
  const { Body, From, To, NumMedia, MediaUrl0, MediaContentType0 } = req.body;

  console.log(`📩 Webhook received from ${From}`);

  // 1. IMMEDIATE ACKNOWLEDGEMENT to prevent Twilio Timeout
  res.type('text/xml').send('<Response></Response>');

  // 2. ASYNC PROCESSING
  (async () => {
    try {
      const hasMedia = parseInt(NumMedia) > 0;
      const textBody = Body || "";
      const isUrl = textBody.match(/https?:\/\/[^\s]+/);

      // Log input type
      if (hasMedia) console.log(`📷 Media received: ${MediaContentType0}`);
      else if (isUrl) console.log(`🔗 URL received: ${textBody}`);
      else console.log(`📝 Text received: "${textBody.substring(0, 50)}..."`);

      if (!hasMedia && !textBody.trim()) {
        console.log("Empty message ignored.");
        return;
      }
      
      // Analyze
      const analysis = await analyzeWithGemini(textBody, hasMedia ? MediaUrl0 : null, hasMedia ? MediaContentType0 : null);
      
      if (!analysis) {
        throw new Error("Analysis returned null/undefined");
      }

      // Format the response (WhatsApp supports Markdown)
      let emoji = '❓';
      if (analysis.verdict === 'TRUE') emoji = '✅';
      if (analysis.verdict === 'FALSE') emoji = '❌';
      if (analysis.verdict === 'MISLEADING') emoji = '⚠️';
      if (analysis.verdict === 'SATIRE') emoji = '🎭';
      if (analysis.verdict === 'UNVERIFIED') emoji = '🔍';

      const reply = `*TathyaSetu Report* ${emoji}\n\n` +
        `*Verdict:* ${analysis.verdict}\n` +
        `*Confidence:* ${analysis.confidence}%\n\n` +
        `_${analysis.summary}_\n\n` +
        `*Key Findings:*\n${(analysis.keyPoints || []).map(p => `• ${p}`).join('\n')}\n\n` +
        `*Verified Sources:*\n${analysis.sources && analysis.sources.length > 0 ? analysis.sources.map(s => `🔗 ${s}`).join('\n') : 'No direct web sources found.'}`;

      // Send reply via Twilio API
      await client.messages.create({
        from: To,
        to: From,
        body: reply
      });

      console.log(`✅ Replied to ${From}`);

    } catch (error) {
      console.error("❌ Error processing message:", error);
      
      try {
          await client.messages.create({
              from: To,
              to: From,
              body: "⚠️ Sorry, I encountered an error while analyzing that. Please try again."
          });
      } catch(e) { 
        console.error("Failed to send error notification:", e);
      }
    }
  })();
});

async function analyzeWithGemini(text, mediaUrl, mediaType) {
  let parts = [];
  
  // Base instructions for all inputs
  const basePrompt = `
    Analyze this content for misinformation. Output JSON.
    Instructions:
    1. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES.
    2. Output Schema:
       - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
       - confidence: 0-100
       - summary: ONE short sentence.
       - keyPoints: Array of max 3 short bullet points.
  `;

  // 1. Handle Media (Images/Audio)
  if (mediaUrl && mediaType) {
      try {
          console.log("Downloading media...", mediaUrl);
          // Download media from Twilio URL
          const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 10000 });
          const base64Data = Buffer.from(mediaResponse.data).toString('base64');
          
          parts.push({
              inlineData: {
                  data: base64Data,
                  mimeType: mediaType
              }
          });
          
          let context = text ? `Context provided by user: "${text}"` : "No text context provided.";
          parts.push({ text: `${basePrompt}\n\nTask: Analyze the claims, visuals, or audio in this file. ${context}` });
          
      } catch (e) {
          console.error("Failed to download media:", e.message);
          // Fallback to text analysis if media fails
          parts.push({ text: `${basePrompt}\n\n[Media Download Failed]. Input Text: "${text}"` });
      }
  } 
  // 2. Handle URL
  else if (text && text.match(/https?:\/\/[^\s]+/)) {
      parts.push({ text: `${basePrompt}\n\nTask: Verify the credibility and accuracy of the content at this link: "${text}".` });
  } 
  // 3. Handle Plain Text
  else {
      parts.push({ text: `${basePrompt}\n\nInput Text: "${text}"` });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ["TRUE", "FALSE", "MISLEADING", "UNVERIFIED", "SATIRE"] },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    // Robust JSON Parsing
    let rawText = response.text || "{}";
    
    // Clean up Markdown code blocks if present (e.g. ```json ... ```)
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
        result = JSON.parse(rawText);
    } catch (e) {
        console.error("Failed to parse JSON response:", rawText);
        throw new Error("Invalid format received from AI");
    }
    
    // Extract Sources
    const sources = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web && chunk.web.uri) {
          // Filter out noisy social media links
          if (!chunk.web.uri.match(/reddit\.com|twitter\.com|x\.com|facebook\.com|instagram\.com/i)) {
               sources.push(chunk.web.uri);
          }
        }
      });
    }
    
    const uniqueSources = [...new Set(sources)].slice(0, 3);
    return { ...result, sources: uniqueSources };

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}

app.listen(PORT || 3000, () => {
  console.log(`🤖 Twilio Bot Server running on port ${PORT || 3000}`);
});