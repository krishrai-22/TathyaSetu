# TathyaSetu (તથ્યસેતુ) 🌉

**TathyaSetu** (Bridge to Truth) is an advanced AI-powered misinformation checker designed to verify news, rumors, and media in real-time. 

Built with **React 19**, **Google Gemini 3 Flash**, and **Google Search Grounding**, it goes beyond simple database lookups by actively searching the live web to verify claims with high accuracy.

![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)
![Gemini](https://img.shields.io/badge/AI-Gemini%203%20Flash-8E75B2.svg)
![Twilio](https://img.shields.io/badge/WhatsApp-Twilio-F22F46.svg)

## ✨ Key Features

### 🌐 Web Application
*   **Multi-Modal Analysis:** Verify **Text**, **Images**, **Audio**, and **URLs**.
*   **Live Grounding:** Uses Google Search to find real-time sources (Major News, Government, Academic).
*   **Multilingual Support:** Full UI and Analysis support for 12 languages including **Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Urdu**.
*   **Text-to-Speech:** Listen to the fact-check analysis using Gemini's natural TTS voices.
*   **Contextual Chat:** Ask follow-up questions about the verdict using a conversational AI interface.
*   **Trending News:** Auto-fetches trending stories related to misinformation technology.

### 💬 WhatsApp Bot (Twilio)
*   Send any text claim to the bot.
*   Receives an instant report with Verdict (True/False/Misleading), Confidence Score, and Source Links.
*   Serverless architecture compatible with Vercel.

### 🧩 Chrome Extension
*   Highlight any text on a webpage.
*   Right-click "Verify with TathyaSetu" to get an instant popup analysis.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, Vite, Tailwind CSS, Lucide React
*   **AI Engine:** Google GenAI SDK (`@google/genai`)
    *   *Analysis:* `gemini-3-flash-preview`
    *   *TTS:* `gemini-2.5-flash-preview-tts`
*   **Backend (Bot):** Node.js, Vercel Serverless Functions
*   **Messaging:** Twilio API (for WhatsApp)
*   **Bundler:** Vite (Supports Web and Extension builds)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))
*   Twilio Account (SID & Auth Token) for the WhatsApp bot.

### 1. Installation

```bash
git clone https://github.com/yourusername/tathyasetu.git
cd tathyasetu
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Required for Web App
API_KEY=your_google_gemini_api_key

# Required for WhatsApp Bot (Vercel/Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### 3. Running the Web App

```bash
npm run dev
```
Open `http://localhost:5173` to view the app.

---

## 🤖 WhatsApp Bot Setup (Vercel + Twilio)

The project includes a serverless function in `api/webhook.js` designed for Vercel.

1.  **Deploy to Vercel:**
    *   Import this repo to Vercel.
    *   Add the Environment Variables (`API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`).
    *   Deploy.

2.  **Configure Twilio:**
    *   Go to **Twilio Console > Messaging > Settings > WhatsApp Sandbox Settings**.
    *   Set the **"When a message comes in"** URL to: `https://your-vercel-app.vercel.app/api/webhook`
    *   Set method to `POST`.

3.  **Test:**
    *   Join your Twilio Sandbox.
    *   Send a message to the bot to verify facts!

---

## 🧩 Building the Chrome Extension

1.  Run the extension build script:
    ```bash
    npm run build:extension
    ```
2.  This creates a `dist-extension` folder.
3.  Open Chrome and go to `chrome://extensions`.
4.  Enable **Developer Mode**.
5.  Click **Load unpacked** and select the `dist-extension` folder.

---

## 📂 Project Structure

```
├── api/                  # Vercel Serverless Functions (WhatsApp Webhook)
├── components/           # React Components (InputForm, ResultCard, etc.)
├── extension/            # Chrome Extension specific files (manifest, background)
├── services/             # Gemini API integration & Logic
├── translations.ts       # Localization logic (12 Languages)
├── types.ts              # TypeScript interfaces
├── App.tsx               # Main React Application
└── vite.config.ts        # Vite Configuration
```


