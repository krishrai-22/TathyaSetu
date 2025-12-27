import { GoogleGenAI, Type } from "@google/genai";
import twilio from 'twilio';

// Vercel Serverless Function for Twilio WhatsApp Bot
export default async function handler(req, res) {
  // 1. Validate Request Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Load Env Vars
  const { API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!API_KEY || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error("Missing Environment Variables");
    return res.status(500).json({ error: "Server Configuration Error" });
  }

  try {
    // 3. Parse Twilio Incoming Data
    // Twilio sends data as 'application/x-www-form-urlencoded'
    // Vercel/Express usually parses this into req.body automatically.
    // The incoming message text is in 'Body', sender is in 'From'.
    const { Body, From, To } = req.body;

    if (!Body) {
      return res.status(400).send('No message body found');
    }

    // 4. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const modelId = "gemini-3-flash-preview";

    // 5. Initialize Twilio Client
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // 6. Gemini Analysis Logic
    const promptText = `
      Analyze for misinformation. Output JSON.
      Instructions:
      1. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES.
      2. Output Schema:
         - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
         - confidence: 0-100
         - summary: ONE short sentence.
         - keyPoints: Array of max 3 short bullet points.
      Input Text: "${Body}"
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

    // 7. Format WhatsApp Message
    let emoji = '❓';
    if (result.verdict === 'TRUE') emoji = '✅';
    if (result.verdict === 'FALSE') emoji = '❌';
    if (result.verdict === 'MISLEADING') emoji = '⚠️';
    if (result.verdict === 'SATIRE') emoji = '🎭';

    const reply = `*TathyaSetu Report* ${emoji}\n\n` +
      `*Verdict:* ${result.verdict}\n` +
      `*Confidence:* ${result.confidence}%\n\n` +
      `_${result.summary}_\n\n` +
      `*Key Findings:*\n${result.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
      `*Verified Sources:*\n${uniqueSources.length > 0 ? uniqueSources.map(s => `🔗 ${s}`).join('\n') : 'No direct web sources found.'}`;

    // 8. Send Reply via Twilio
    // We send a message back to the 'From' number (User), coming from the 'To' number (Twilio Bot)
    await client.messages.create({
      from: To, // This is the Twilio Sandbox number the user messaged
      to: From, // This is the User's number
      body: reply
    });

    // 9. Respond to Webhook (TwiML not needed if we used client.messages.create)
    return res.status(200).send('OK');

  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return res.status(500).send('Internal Server Error');
  }
}