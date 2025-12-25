# 🛡️ TathyaSetu  
AI-Based Fake News & Misinformation Detector

TathyaSetu is an AI-powered misinformation detection system designed for the Indian digital ecosystem. It analyzes **text, images, audio, video, and URLs** across **all major Indian languages (including Hinglish)** to classify content as **Reliable, Misleading, or Unverified**.

---

## 🔍 What Problem Does It Solve?
India faces large-scale misinformation spread across social media, messaging apps, and news platforms—often in multiple regional languages and mixed formats (text + media). Existing tools are mostly English-centric and text-only.

TathyaSetu bridges this gap with **multilingual, multimodal AI-based verification**.

---

## 🚀 Key Features
- Multilingual NLP for Indian languages + Hinglish  
- Fake news & misinformation classification  
- URL credibility and source verification  
- Multimodal analysis (text, image, audio, video)  
- Real-time web grounding  
- Explainable AI-based verdicts  

---

## 🧠 How It Works (Architecture – Text View)

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
- Real-time web search grounding  
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
- Digital literacy and public awareness  

---

## 🛠️ Local Setup
```bash
git clone https://github.com/krishrai-22/TathyaSetu.git
cd TathyaSetu
npm install

 **Environment Setup**
   Create a `.env.local` file:
   ```env
API_KEY = your api key
npm run dev

**Open your browser**
  `npm run dev`
