import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const { API_KEY, WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, VERIFY_TOKEN, PORT } = process.env;

if (!API_KEY || !WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
  console.error("Missing Environment Variables. Please check .env file.");
  process.exit(1);
}

// Gemini Setup
const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelId = "gemini-3-flash-preview";

// 1. Webhook Verification (Required by Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// 2. Message Handling
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // User's phone number
      const msgBody = message.text ? message.text.body : null;

      if (msgBody) {
        // Acknowledge receipt immediately to avoid timeouts
        res.sendStatus(200);
        
        // Process in background
        try {
          await handleMessage(from, msgBody);
        } catch (error) {
          console.error("Error processing message:", error);
          await sendWhatsAppMessage(from, "Sorry, I encountered an error while analyzing that.");
        }
      } else {
        res.sendStatus(200); // We only support text for now
      }
    } else {
      res.sendStatus(404);
    }
  }
});

async function handleMessage(to, text) {
  // Inform user we are working
  // await sendWhatsAppMessage(to, "🔍 Analyzing facts..."); 

  const analysis = await analyzeWithGemini(text);
  
  // Format the response for WhatsApp (Markdown)
  let emoji = '❓';
  if (analysis.verdict === 'TRUE') emoji = '✅';
  if (analysis.verdict === 'FALSE') emoji = '❌';
  if (analysis.verdict === 'MISLEADING') emoji = '⚠️';
  if (analysis.verdict === 'SATIRE') emoji = '🎭';

  const reply = `*TathyaSetu Report* ${emoji}\n\n` +
    `*Verdict:* ${analysis.verdict}\n` +
    `*Confidence:* ${analysis.confidence}%\n\n` +
    `_${analysis.summary}_\n\n` +
    `*Key Findings:*\n${analysis.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
    `*Verified Sources:*\n${analysis.sources.length > 0 ? analysis.sources.map(s => `🔗 ${s}`).join('\n') : 'No direct web sources found.'}`;

  await sendWhatsAppMessage(to, reply);
}

async function analyzeWithGemini(input) {
  const promptText = `
    Analyze for misinformation. Output JSON.
    Instructions:
    1. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES (Major News, Gov, Academic).
    2. DO NOT CITE social media threads (Reddit, Twitter/X, Facebook).
    3. Output Schema:
       - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
       - confidence: 0-100
       - summary: ONE short sentence.
       - keyPoints: Array of max 3 short bullet points.
    Input Text: "${input}"
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: { parts: [{ text: promptText }] },
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

  const result = JSON.parse(response.text);
  
  // Extract Sources
  const sources = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk) => {
      if (chunk.web && chunk.web.uri) {
        // Strict Filter: No Social Media
        if (!chunk.web.uri.match(/reddit\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|tiktok\.com|pinterest\.com/i)) {
             sources.push(chunk.web.uri);
        }
      }
    });
  }
  
  // Dedup sources
  const uniqueSources = [...new Set(sources)].slice(0, 3); // Limit to top 3

  return { ...result, sources: uniqueSources };
}

async function sendWhatsAppMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        text: { body: body },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
  }
}

app.listen(PORT || 3000, () => {
  console.log(`Bot is running on port ${PORT || 3000}`);
});