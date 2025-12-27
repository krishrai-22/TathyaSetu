# TathyaSetu (તથ્યસેતુ) 🌉

**TathyaSetu** (Bridge to Truth) is a professional, AI-powered misinformation checker. It combines **Google Gemini 3** (Flash & Pro) with **Google Search Grounding** to provide real-time, evidence-based verification of text, images, audio, and URLs.

It is designed to be accessible across multiple platforms: **Web App**, **WhatsApp Bot**, and **Chrome Extension**.

![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)
![Gemini 3](https://img.shields.io/badge/AI-Gemini%203%20Flash-8E75B2.svg)
![Twilio](https://img.shields.io/badge/WhatsApp-Twilio-F22F46.svg)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF.svg?logo=vite)

## ✨ Features

### 🌐 Web Application
*   **Multi-Modal Inputs:** Verify **Text**, **Images** (OCR & Analysis), **Audio** (Speech-to-Text Analysis), and **URLs**.
*   **Live Grounding:** actively searches the web for the latest news to verify claims, citing reliable sources like Reuters, AP, and .gov sites.
*   **12 Indian Languages:** Full support (UI & Analysis) for **Hindi, English, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu**.
*   **AI Text-to-Speech:** Listen to the fact-check report in the selected language.
*   **Conversational AI:** "Chat with the Verdict" widget allows users to ask follow-up questions about the analysis.
*   **Trending News:** Auto-fetches fact-check worthy news based on the selected region.

### 💬 WhatsApp Bot (Twilio)
*   Send any text or claim to the bot number.
*   Receive an instant, structured report with:
    *   Verdict (True/False/Misleading/Satire)
    *   Confidence Score
    *   Key Findings
    *   Source Links
*   Built on a serverless architecture (Vercel Functions) or standalone Node.js server.

### 🧩 Chrome Extension
*   Context menu integration: Highlight text on any website > Right-click > **"Verify with TathyaSetu"**.
*   Opens a popup with an instant AI analysis of the selected text.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, Tailwind CSS, Lucide React, Vite
*   **AI:** Google GenAI SDK (`gemini-3-flash-preview` for analysis, `gemini-2.5-flash-preview-tts` for audio)
*   **Backend:** Node.js (Express) or Vercel Serverless Functions
*   **Messaging:** Twilio API (WhatsApp)

---

## 🚀 Getting Started

### 1. Prerequisites
*   **Node.js** (v18 or higher)
*   **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))
*   **Twilio Account** (Account SID & Auth Token) for WhatsApp features.

### 2. Installation
```bash
git clone https://github.com/yourusername/tathyasetu.git
cd tathyasetu
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
# Required for Web App & Extension
API_KEY=your_google_gemini_api_key

# Required for WhatsApp Bot (Both Vercel and Standalone)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
PORT=3000
```

### 4. Running the Web App
```bash
npm run dev
```
Visit `http://localhost:5173`.

---

## 🤖 WhatsApp Bot Setup

You have two options to run the WhatsApp bot. Both require the same `.env` configuration.

### Option A: Vercel Serverless (Recommended)
This uses the file at `api/webhook.js`.
1.  Deploy the project to Vercel.
2.  Add `API_KEY`, `TWILIO_ACCOUNT_SID`, and `TWILIO_AUTH_TOKEN` in Vercel Project Settings > Environment Variables.
3.  In **Twilio Console** > **Messaging** > **WhatsApp Sandbox Settings**:
    *   Set **"When a message comes in"** to `https://your-vercel-app.vercel.app/api/webhook` (Method: POST).

### Option B: Standalone Node Server
This uses the file at `server/index.js` (useful for VPS like DigitalOcean/AWS).
1.  Navigate to the server directory (or root if running merged):
    ```bash
    # Install server dependencies first if not done
    cd server
    npm install
    
    # Run server (from root)
    node server/index.js
    ```
2.  Use **ngrok** to expose your local port 3000:
    ```bash
    ngrok http 3000
    ```
3.  In **Twilio Console** > **Messaging** > **WhatsApp Sandbox Settings**:
    *   Set **"When a message comes in"** to your ngrok URL: `https://your-ngrok-url.app/webhook` (Method: POST).

---

## 🧩 Chrome Extension Build

1.  Build the extension:
    ```bash
    npm run build:extension
    ```
    This generates a `dist-extension` folder.
2.  Load in Chrome:
    *   Go to `chrome://extensions`
    *   Enable **Developer Mode** (top right).
    *   Click **Load unpacked**.
    *   Select the `dist-extension` folder.

---

## 📂 Project Structure

```
├── api/                  # Vercel Serverless Function (Twilio Webhook)
├── server/               # Standalone Node.js Express Server (Twilio Bot)
├── extension/            # Chrome Extension source (manifest, background, popup)
├── components/           # React Components (InputForm, ResultCard, etc.)
├── services/             # Gemini API integration & Logic
├── translations.ts       # Localization for 12 languages
├── App.tsx               # Main Web App Entry
└── vite.config.ts        # Vite Config for Web
└── vite.extension.config.ts # Vite Config for Extension
```

## ⚠️ Notes regarding Build Warnings
*   If you see `npm warn deprecated scmp`, this is a dependency of older Twilio versions. We have updated to `twilio@^5.0.0` to resolve this.
*   `node-domexception` warnings are harmless transitive dependencies used by build tools.

## 🛡️ License
MIT
