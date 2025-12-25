# 🛡️ TathyaSetu  
AI-Based Fake News & Misinformation Detector

TathyaSetu is an AI-powered misinformation detection system designed for the Indian digital ecosystem. It analyzes **text, images, audio, video, and URLs** across **all major Indian languages (including Hinglish)** to classify content as **Reliable, Misleading, or Unverified**.

---

## 🔍 Problem Statement
India faces large-scale misinformation spread across social media, messaging platforms, and news portals—often in regional languages and mixed formats (text + media). Most existing tools are English-centric and text-only.

TathyaSetu addresses this gap with **multilingual, multimodal AI-driven verification**.

---

## 🚀 Key Features
- Multilingual NLP for Indian languages + Hinglish  
- Fake news & misinformation detection  
- URL credibility and source verification  
- Multimodal analysis (text, image, audio, video)  
- Real-time web grounding  
- Explainable AI-based verdicts  

---

## 🧠 How It Works (System Architecture – Text)

**1. User Input**  
Users submit content via Web App or Browser Extension:
- Text
- Image
- Audio
- Video
- URL

**2. Input Processing**
- Content normalization  
- Language detection  
- Media-type identification  

**3. AI Analysis**
- Multilingual semantic understanding  
- Context extraction from text and media  
- Pattern detection using generative AI models  

**4. Verification & Grounding**
- Real-time web/search grounding  
- Cross-checking claims with reliable sources  

**5. Decision Engine**
- Aggregates AI confidence signals  
- Classifies content as:
  - Reliable
  - Misleading
  - Unverified  

**6. Output**
- Final verdict with confidence score  
- Supporting reasoning and references (when available)

---

## 🏗️ Tech Stack
- **Frontend:** React + Vite  
- **Backend:** Node.js (API-based architecture)  
- **AI Models:** Google Gemini  
- **Verification:** Real-time search grounding  
- **Deployment Ready:** Web App & Browser Extension  

---

## 🧩 Use Cases
- Social media fact-checking  
- News and article verification  
- Browser-based misinformation alerts  
- Academic & research validation  
- Digital literacy & public awareness  

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
