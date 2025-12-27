import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Global Error Handlers to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize Clients
const ai = new GoogleGenAI({ apiKey: API_KEY });
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const modelId = "gemini-3-flash-preview";

app.post('/webhook', (req, res) => {
  const { Body, From, To } = req.body;

  console.log(`📩 Webhook received from ${From}`);

  const textBody = Body || "";

  // Filter out empty messages early
  if (!textBody.trim()) {
    console.log("Empty message ignored.");
    return res.type('text/xml').send('<Response></Response>');
  }

  // 1. IMMEDIATE FEEDBACK: Send "Analyzing" message via TwiML
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message("🔍 TathyaSetu is verifying this claim... Please wait.");
  res.type('text/xml').send(twiml.toString());

  // 2. PROCESS LOGIC (Fire and Forget)
  processMessage({ Body, From, To })
    .catch(err => console.error("❌ Fatal Error in processMessage:", err));
});

async function processMessage({ Body, From, To }) {
    try {
      const textBody = Body || "";
      console.log(`📝 Text received: "${textBody.substring(0, 50)}..."`);
      
      // Analyze (Text Only)
      const analysis = await analyzeWithGemini(textBody);
      
      // Format the response (WhatsApp supports Markdown)
      let emoji = '❓';
      if (analysis.verdict === 'TRUE') emoji = '✅';
      if (analysis.verdict === 'FALSE') emoji = '❌';
      if (analysis.verdict === 'MISLEADING') emoji = '⚠️';
      if (analysis.verdict === 'SATIRE') emoji = '🎭';
      if (analysis.verdict === 'UNVERIFIED') emoji = '🔍';

      // Use localized labels from the analysis response
      const ui = analysis.ui_text || { report_title: "TathyaSetu Report", confidence_label: "Confidence", findings_label: "Key Findings" };
      const vLabel = analysis.verdict_label || analysis.verdict;

      const reply = `*${ui.report_title}* ${emoji}\n\n` +
        `*${vLabel}*\n` +
        `*${ui.confidence_label}:* ${analysis.confidence || 0}%\n\n` +
        `_${analysis.summary || 'No summary available.'}_\n\n` +
        `*${ui.findings_label}:*\n${(analysis.keyPoints && analysis.keyPoints.length > 0) ? analysis.keyPoints.map(p => `• ${p}`).join('\n') : ''}`;

      // Send reply via Twilio API
      await client.messages.create({
        from: To,
        to: From,
        body: reply
      });

      console.log(`✅ Replied to ${From}`);

    } catch (error) {
      console.error("❌ Error processing message logic:", error.message);
      
      // Attempt to send error message to user so they know it failed
      try {
          await client.messages.create({
              from: To,
              to: From,
              body: "⚠️ Sorry, I encountered an error while analyzing that. Please try again later."
          });
      } catch(e) { 
        console.error("Failed to send error notification to user:", e.message);
      }
    }
}

async function analyzeWithGemini(text) {
  // Base instructions with language detection
  const basePrompt = `
    Analyze this content for misinformation. Output JSON.
    Instructions:
    1. Detect the language of the User's Input Text. If the input is just a URL, detect the language of the content at that URL.
    2. Use googleSearch to verify. FIND AND CITE AT LEAST 3 DISTINCT, RELIABLE SOURCES.
    3. Output Schema:
       - verdict: TRUE/FALSE/MISLEADING/UNVERIFIED/SATIRE
       - verdict_label: The verdict word translated to the DETECTED LANGUAGE.
       - confidence: 0-100 (integer)
       - summary: ONE short sentence explaining the verdict in the DETECTED LANGUAGE.
       - keyPoints: Array of exactly 3 short bullet points in the DETECTED LANGUAGE.
       - ui_text: Object with translated labels for: "TathyaSetu Report" (report_title), "Confidence" (confidence_label), "Key Findings" (findings_label).
  `;

  let parts = [];
  
  // Handle URL
  if (text && text.match(/https?:\/\/[^\s]+/)) {
      parts.push({ text: `${basePrompt}\n\nTask: Verify the credibility and accuracy of the content at this link: "${text}".` });
  } 
  // Handle Plain Text
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

    // Robust JSON Parsing
    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let result = {};
    try {
        result = JSON.parse(rawText);
    } catch (e) {
        console.error("Failed to parse JSON response:", rawText);
        result = {}; 
    }

    // Default Fallbacks
    const finalResult = {
        verdict: result.verdict || "UNVERIFIED",
        verdict_label: result.verdict_label || result.verdict || "Unverified",
        confidence: result.confidence || 0,
        summary: result.summary || "Analysis could not be completed successfully.",
        keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : ["No detailed findings available."],
        ui_text: result.ui_text || { report_title: "TathyaSetu Report", confidence_label: "Confidence", findings_label: "Key Findings" }
    };
    
    // Extract Sources (kept for internal logic if needed, but not displayed per user request)
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
    return { ...finalResult, sources: uniqueSources };

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}

app.listen(PORT || 3000, () => {
  console.log(`🤖 Twilio Bot Server running on port ${PORT || 3000}`);
});