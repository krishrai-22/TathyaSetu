import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

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

app.post('/webhook', async (req, res) => {
  // Twilio sends 'Body', 'From', and 'To' in the request body
  const { Body, From, To } = req.body;

  if (!Body) {
    console.log("Received empty body or non-message request");
    return res.status(200).send('No body'); 
  }

  console.log(`📩 Message from ${From}: ${Body.substring(0, 50)}...`);

  try {
    const analysis = await analyzeWithGemini(Body);
    
    // Format the response (WhatsApp supports Markdown)
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

    // Send reply via Twilio SDK
    await client.messages.create({
      from: To, // The Twilio Bot Number
      to: From, // The User's Number
      body: reply
    });

    console.log(`✅ Replied to ${From}`);
    res.status(200).send('OK');

  } catch (error) {
    console.error("Error processing message:", error);
    
    // Attempt to send error message to user
    try {
        await client.messages.create({
            from: To,
            to: From,
            body: "⚠️ Sorry, I encountered an error while analyzing that. Please try again."
        });
    } catch(e) { /* Ignore send error */ }

    // Return 200 to prevent Twilio from retrying indefinitely on logic errors
    res.status(200).send('Error');
  }
});

async function analyzeWithGemini(input) {
  const promptText = `
    Analyze for misinformation. Output JSON.
    Instructions:
    1. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES.
    2. Output Schema:
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
        if (!chunk.web.uri.match(/reddit\.com|twitter\.com|x\.com|facebook\.com|instagram\.com/i)) {
             sources.push(chunk.web.uri);
        }
      }
    });
  }
  
  const uniqueSources = [...new Set(sources)].slice(0, 3);
  return { ...result, sources: uniqueSources };
}

app.listen(PORT || 3000, () => {
  console.log(`🤖 Twilio Bot Server running on port ${PORT || 3000}`);
});