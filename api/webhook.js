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
    const { Body, From, To } = req.body;
    
    if (!Body) {
        // Ignore empty or media-only messages
        return res.status(200).send('OK'); 
    }

    // 4. Initialize Twilio Client
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    // 5. Send "Analyzing" Status Message
    await client.messages.create({
        from: To,
        to: From,
        body: "🔍 TathyaSetu is verifying this claim... Please wait."
    });

    // 6. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const modelId = "gemini-3-flash-preview";

    // 7. Gemini Analysis Logic (Text Only)
    const promptText = `
      Analyze for misinformation. Output JSON.
      Instructions:
      1. Detect the language of the User's Input Text. If it is a URL, detect the language of the content.
      2. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES.
      3. Output Schema:
         - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
         - verdict_label: The verdict word translated to the DETECTED LANGUAGE.
         - confidence: 0-100 (integer)
         - summary: ONE short sentence explaining the verdict in the DETECTED LANGUAGE.
         - keyPoints: Array of exactly 3 short bullet points in the DETECTED LANGUAGE.
         - ui_text: Object with translated labels for: "TathyaSetu Report" (report_title), "Confidence" (confidence_label), "Key Findings" (findings_label).
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
            verdict_label: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            ui_text: {
                type: Type.OBJECT,
                properties: {
                    report_title: { type: Type.STRING },
                    confidence_label: { type: Type.STRING },
                    findings_label: { type: Type.STRING }
                },
                required: ["report_title", "confidence_label", "findings_label"]
            }
          },
          required: ["verdict", "verdict_label", "confidence", "summary", "keyPoints", "ui_text"],
        },
      },
    });

    let result = {};
    try {
        let rawText = response.text || "{}";
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(rawText);
    } catch(e) {
        console.error("Failed to parse JSON", e);
        result = {};
    }

    // Fallbacks
    const finalResult = {
        verdict: result.verdict || "UNVERIFIED",
        verdict_label: result.verdict_label || result.verdict || "Unverified",
        confidence: result.confidence || 0,
        summary: result.summary || "Could not complete full analysis.",
        keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : ["No detailed findings."],
        ui_text: result.ui_text || { report_title: "TathyaSetu Report", confidence_label: "Confidence", findings_label: "Key Findings" }
    };

    // Extract Sources (kept logic but not displayed)
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

    // 8. Format WhatsApp Message
    let emoji = '❓';
    if (finalResult.verdict === 'TRUE') emoji = '✅';
    if (finalResult.verdict === 'FALSE') emoji = '❌';
    if (finalResult.verdict === 'MISLEADING') emoji = '⚠️';
    if (finalResult.verdict === 'SATIRE') emoji = '🎭';

    const ui = finalResult.ui_text;
    const vLabel = finalResult.verdict_label;

    const reply = `*${ui.report_title}* ${emoji}\n\n` +
      `*${vLabel}*\n` +
      `*${ui.confidence_label}:* ${finalResult.confidence}%\n\n` +
      `_${finalResult.summary}_\n\n` +
      `*${ui.findings_label}:*\n${(finalResult.keyPoints || []).map(p => `• ${p}`).join('\n')}`;

    // 9. Send Reply via Twilio
    await client.messages.create({
      from: To,
      to: From,
      body: reply
    });

    return res.status(200).send('OK');

  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return res.status(200).send('Error');
  }
}