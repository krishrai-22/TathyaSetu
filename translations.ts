import { VerdictType, Language } from './types';

interface VerdictConfig {
  label: string;
  desc: string;
}

interface ModalTranslations {
  title: string;
  processTitle: string;
  processDesc: string;
  steps: string[];
  sourcesTitle: string;
  sourcesDesc: string;
  majorNews: string;
  majorNewsDesc: string;
  academic: string;
  academicDesc: string;
  metricsTitle: string;
  consensus: string;
  consensusDesc: string;
  context: string;
  contextDesc: string;
  bias: string;
  biasDesc: string;
  gotIt: string;
  // New Unique Section
  uniqueTitle: string;
  uniqueDesc: string;
  uniqueFeatures: { title: string; desc: string }[];
  flowLabel: string;
  flowStep1: string;
  flowStep2: string;
  flowStep3: string;
}

export interface TranslationSchema {
  appTitle: string;
  aboutMethodology: string; // Maps to "Why TathyaSetu?"
  news: string;
  more: string;
  getStarted: string;
  heroTitle: string;
  heroSubtitle: string;
  inputPlaceholder: string;
  analyzing: string;
  verifyBtn: string;
  chars: string;
  footer: string;
  loadingMessage: string;
  didYouKnow: string;
  errorTitle: string;
  shareReport: string;
  copied: string;
  verificationScore: string;
  detailedAnalysis: string;
  keyFindings: string;
  verifiedSources: string;
  uploadTooltip: string;
  recordTooltip: string;
  stopRecording: string;
  recording: string;
  removeFile: string;
  fileTooLarge: string;
  supports: string;
  sizeLimit: string; // New
  // New keys
  listenToAnalysis: string;
  stopAudio: string;
  translateTo: string;
  chatAboutAnalysis: string;
  chatContextIntro: string;
  chatPlaceholder: string;
  translating: string;
  generatingAudio: string;
  // URL keys
  urlTooltip: string;
  pasteUrl: string;
  invalidUrl: string;
  removeUrl: string;
  urlDisclaimer: string; // New
  // News keys
  latestNews: string;
  newsSubtitle: string;
  readMore: string;
  loadingNews: string;
  loadMoreNews: string;
  
  // Promo Section Keys
  promoTitle: string;
  promoSubtitle: string;
  promoWhatsappTitle: string;
  promoWhatsappDesc: string;
  promoExtensionTitle: string;
  promoExtensionDesc: string;
  
  // WhatsApp Demo Keys
  waDemoBtn: string;
  waOnline: string;
  waTyping: string;
  waPlaceholder: string;
  waWelcome: string;
  waDisclaimer: string;
  waComingSoon: string;

  verdictLabels: Record<VerdictType, VerdictConfig>;
  modal: ModalTranslations;
  newsCategories: {
    trending: string;
    india: string;
    world: string;
    technology: string;
    business: string;
    science: string;
    health: string;
    sports: string;
  };
}

// Helper: Define English translation first to avoid block-scoped variable usage error
const enTranslation: TranslationSchema = {
  appTitle: "TathyaSetu",
  aboutMethodology: "Why TathyaSetu?",
  news: "News",
  more: "More",
  getStarted: "Get Started",
  heroTitle: "AI-Powered Fact Checker",
  heroSubtitle: "Verify everything with every format and every Indian language.",
  inputPlaceholder: "Paste text here, or upload media to verify...",
  analyzing: "Analyzing...",
  verifyBtn: "Verify Facts",
  chars: "characters",
  footer: "Powered by Gemini 3 Pro. Press Cmd + Enter to submit.",
  loadingMessage: "Analyzing content semantics & verifying sources...",
  didYouKnow: "Did you know?",
  errorTitle: "Error during analysis",
  shareReport: "Share Report",
  copied: "Copied",
  verificationScore: "Verification Score",
  detailedAnalysis: "Detailed Analysis",
  keyFindings: "Key Findings",
  verifiedSources: "Verified Sources",
  uploadTooltip: "Upload Media",
  recordTooltip: "Record Audio",
  stopRecording: "Stop Recording",
  recording: "Recording...",
  removeFile: "Remove file",
  fileTooLarge: "File too large (Max 100MB)",
  supports: "Supports JPG, PNG, MP4, MP3, WAV",
  sizeLimit: "Max size: 100MB",
  listenToAnalysis: "Listen to Analysis",
  stopAudio: "Stop Audio",
  translateTo: "Translate Result",
  chatAboutAnalysis: "Chat with AI about this result",
  chatContextIntro: "I can answer follow-up questions about this specific analysis.",
  chatPlaceholder: "Ask more details about this verdict...",
  translating: "Translating...",
  generatingAudio: "Generating Audio...",
  urlTooltip: "Add Link",
  pasteUrl: "Paste URL and press Enter...",
  invalidUrl: "Please enter a valid URL (e.g., https://example.com)",
  removeUrl: "Remove Link",
  urlDisclaimer: "Some links may not be checkable.",
  latestNews: "Latest News",
  newsSubtitle: "Trending stories related to misinformation and technology.",
  readMore: "Read full story",
  loadingNews: "Fetching latest news...",
  loadMoreNews: "Generate More News",
  
  // Promo Section
  promoTitle: "Try TathyaSetu on WhatsApp & Web Extension",
  promoSubtitle: "Experience AI-powered fact checking on your favorite platforms. Use our WhatsApp bot or browser extension for instant verification.",
  promoWhatsappTitle: "WhatsApp Bot",
  promoWhatsappDesc: "Chat with TathyaSetu on WhatsApp for quick fact checks and misinformation detection.",
  promoExtensionTitle: "Web Extension",
  promoExtensionDesc: "Use the TathyaSetu browser extension to verify articles and social posts instantly.",

  // WhatsApp Demo
  waDemoBtn: "Try Interactive Demo",
  waOnline: "Online",
  waTyping: "typing...",
  waPlaceholder: "Type a claim to verify...",
  waWelcome: "👋 Hi! I'm TathyaSetu. Forward me any text, news, or rumor, and I'll fact-check it for you instantly.",
  waDisclaimer: "This is a live simulation using the Gemini 3 Pro engine.",
  waComingSoon: "Actual Bot Available Soon",

  verdictLabels: {
    [VerdictType.TRUE]: { label: "Credible", desc: "This content appears to be factually accurate based on available sources." },
    [VerdictType.FALSE]: { label: "False Information", desc: "This content contains claims that have been proven false." },
    [VerdictType.MISLEADING]: { label: "Misleading", desc: "This content may use partial truths, visual manipulation, or lack context to mislead." },
    [VerdictType.SATIRE]: { label: "Satire", desc: "This content is intended as humor or satire, not fact." },
    [VerdictType.UNVERIFIED]: { label: "Unverified", desc: "Insufficient credible evidence found to verify this content." }
  },
  modal: {
    title: "Why TathyaSetu",
    processTitle: "The Verification Process",
    processDesc: "TathyaSetu uses the Gemini 3 Pro model combined with real-time Google Search Grounding. Unlike standard AI that relies only on training data, our system actively browses the live web to find the most recent evidence.",
    steps: [
      "Step 1: The AI extracts core claims and analyzes visual/audio evidence from your input.",
      "Step 2: It queries the Google Search index for multiple perspectives.",
      "Step 3: It compares your content against established facts found in the search results.",
      "Step 4: A 'Verdict' is assigned based on the consensus of credible sources."
    ],
    sourcesTitle: "What We Consider 'Credible'",
    sourcesDesc: "Not all sources are created equal. Our algorithm prioritizes information from domains with high authority and accountability standards.",
    majorNews: "Major News Outlets",
    majorNewsDesc: "Reuters, AP, BBC, NYT, and other organizations with strict editorial standards.",
    academic: "Academic & Gov",
    academicDesc: "Peer-reviewed journals, university publications (.edu), and government reports (.gov).",
    metricsTitle: "Evaluation Metrics",
    consensus: "Consensus",
    consensusDesc: "Is the claim reported by multiple independent sources, or is it an outlier?",
    context: "Context",
    contextDesc: "Is the information technically true but presented in a misleading way? (e.g., old photos used for new events).",
    bias: "Bias Check",
    biasDesc: "The AI analyzes loaded language, visual manipulation, and emotional tactics.",
    gotIt: "Got it",
    // Unique Section
    uniqueTitle: "Why TathyaSetu is Unique",
    uniqueDesc: "While many tools rely on outdated databases, TathyaSetu is built for the real-time information age.",
    uniqueFeatures: [
      { title: "Real-Time Grounding", desc: "We don't just guess; we Google it. Our AI connects to live Google Search to verify events happening right now." },
      { title: "Native Multi-Modal", desc: "Most checkers only read text. We can listen to audio files and watch videos to find deep-fakes or manipulated media." },
      { title: "Linguistic Depth", desc: "Specialized in Hindi and Hinglish nuances, understanding local context better than generic global models." }
    ],
    flowLabel: "The TathyaSetu Difference",
    flowStep1: "User Input (Text/Media)",
    flowStep2: "Live Web Investigation",
    flowStep3: "Fact-Checked Verdict"
  },
  newsCategories: {
    trending: "Trending",
    india: "India",
    world: "World",
    technology: "Technology",
    business: "Business",
    science: "Science",
    health: "Health",
    sports: "Sports"
  }
};

export const translations: Record<Language, TranslationSchema> = {
  en: enTranslation,
  hi: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu क्यों?",
    news: "समाचार",
    more: "अधिक",
    getStarted: "शुरू करें",
    heroTitle: "AI-संचालित फैक्ट चेकर",
    heroSubtitle: "हर प्रारूप और हर भारतीय भाषा में सब कुछ सत्यापित करें।",
    inputPlaceholder: "सत्यापन के लिए यहाँ टेक्स्ट पेस्ट करें या मीडिया अपलोड करें...",
    analyzing: "विश्लेषण कर रहा है...",
    verifyBtn: "तथ्यों की पुष्टि करें",
    chars: "वर्ण",
    footer: "जेमिनी 3 प्रो द्वारा संचालित। सबमिट करने के लिए Cmd + Enter दबाएं।",
    loadingMessage: "सामग्री का विश्लेषण और स्रोतों का सत्यापन...",
    didYouKnow: "क्या आप जानते हैं?",
    errorTitle: "विश्लेषण के दौरान त्रुटि",
    shareReport: "रिपोर्ट साझा करें",
    copied: "कॉपी किया गया",
    verificationScore: "सत्यापन स्कोर",
    detailedAnalysis: "विस्तृत विश्लेषण",
    keyFindings: "मुख्य निष्कर्ष",
    verifiedSources: "सत्यापित स्रोत",
    uploadTooltip: "मीडिया अपलोड करें",
    recordTooltip: "ऑडियो रिकॉर्ड करें",
    stopRecording: "रिकॉर्डिंग रोकें",
    recording: "रिकॉर्डिंग हो रही है...",
    removeFile: "फ़ाइल हटाएँ",
    fileTooLarge: "फ़ाइल बहुत बड़ी है (अधिकतम 100MB)",
    supports: "JPG, PNG, MP4, MP3, WAV का समर्थन करता है",
    sizeLimit: "अधिकतम आकार: 100MB",
    listenToAnalysis: "विश्लेषण सुनें",
    stopAudio: "ऑडियो रोकें",
    translateTo: "परिणाम का अनुवाद करें",
    chatAboutAnalysis: "इस परिणाम के बारे में AI से चैट करें",
    chatContextIntro: "मैं इस विशिष्ट विश्लेषण के बारे में अनुवर्ती प्रश्नों का उत्तर दे सकता हूं।",
    chatPlaceholder: "इस निर्णय के बारे में और विवरण पूछें...",
    translating: "अनुवाद हो रहा है...",
    generatingAudio: "ऑडियो बन रहा है...",
    urlTooltip: "लिंक जोड़ें",
    pasteUrl: "URL यहाँ पेस्ट करें...",
    invalidUrl: "कृपया एक वैध URL दर्ज करें (जैसे, https://example.com)",
    removeUrl: "लिंक हटाएँ",
    urlDisclaimer: "कुछ लिंक की जाँच नहीं की जा सकती।",
    latestNews: "ताज़ा खबरें",
    newsSubtitle: "गलत सूचना और प्रौद्योगिकी से संबंधित ट्रेंडिंग कहानियां।",
    readMore: "पूरी कहानी पढ़ें",
    loadingNews: "नवीनतम समाचार ला रहे हैं...",
    loadMoreNews: "और समाचार लोड करें",
    
    // Promo Section
    promoTitle: "WhatsApp और वेब एक्सटेंशन पर TathyaSetu आज़माएं",
    promoSubtitle: "अपने पसंदीदा प्लेटफॉर्म पर एआई-संचालित तथ्य जाँच का अनुभव करें। त्वरित सत्यापन के लिए हमारे व्हाट्सएप बॉट या ब्राउज़र एक्सटेंशन का उपयोग करें।",
    promoWhatsappTitle: "व्हाट्सएप बॉट",
    promoWhatsappDesc: "त्वरित तथ्य जाँच और गलत सूचना का पता लगाने के लिए व्हाट्सएप पर TathyaSetu के साथ चैट करें।",
    promoExtensionTitle: "वेब एक्सटेंशन",
    promoExtensionDesc: "लेखों और सामाजिक पोस्टों को तुरंत सत्यापित करने के लिए TathyaSetu ब्राउज़र एक्सटेंशन का उपयोग करें।",

    // WhatsApp Demo
    waDemoBtn: "इंटरैक्टिव डेमो आज़माएं",
    waOnline: "ऑनलाइन",
    waTyping: "टाइप कर रहा है...",
    waPlaceholder: "सत्यापन के लिए दावा टाइप करें...",
    waWelcome: "👋 नमस्ते! मैं TathyaSetu हूँ। मुझे कोई भी टेक्स्ट या समाचार भेजें, और मैं उसे तुरंत फैक्ट-चेक करूंगा।",
    waDisclaimer: "यह जेमिनी 3 प्रो इंजन का उपयोग करके एक लाइव सिमुलेशन है।",
    waComingSoon: "असली बॉट जल्द ही उपलब्ध होगा",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "विश्वसनीय", desc: "उपलब्ध स्रोतों के आधार पर यह सामग्री तथ्यात्मक रूप से सटीक प्रतीत होती है।" },
      [VerdictType.FALSE]: { label: "गलत जानकारी", desc: "इस सामग्री में ऐसे दावे हैं जो गलत साबित हुए हैं।" },
      [VerdictType.MISLEADING]: { label: "भ्रामक", desc: "यह सामग्री गुमराह करने के लिए आंशिक सत्य या दृश्य हेरफेर का उपयोग कर सकती है।" },
      [VerdictType.SATIRE]: { label: "व्यंग्य", desc: "यह सामग्री हास्य या व्यंग्य के रूप में है, तथ्य नहीं।" },
      [VerdictType.UNVERIFIED]: { label: "असत्यापित", desc: "इस सामग्री को सत्यापित करने के लिए अपर्याप्त विश्वसनीय प्रमाण मिले।" }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ट्रेंडिंग",
      india: "भारत",
      world: "विश्व",
      technology: "प्रौद्योगिकी",
      business: "व्यापार",
      science: "विज्ञान",
      health: "स्वास्थ्य",
      sports: "खेल"
    }
  },
  hinglish: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu Kyun?",
    news: "News",
    more: "More",
    getStarted: "Shuru Karein",
    heroTitle: "AI-Powered Fact Checker",
    heroSubtitle: "Har format aur har Indian language mein sab kuch verify karein.",
    inputPlaceholder: "Yahan text paste karein ya media upload karein verify karne ke liye...",
    analyzing: "Analyze kar raha hai...",
    verifyBtn: "Facts Check Karein",
    chars: "characters",
    footer: "Gemini 3 Pro dwara powered. Submit karne ke liye Cmd + Enter dabayein.",
    loadingMessage: "Content semantics analyze aur sources verify ho rahe hain...",
    didYouKnow: "Kya aap jante hain?",
    errorTitle: "Analysis mein error aayi",
    shareReport: "Report Share Karein",
    copied: "Copied",
    verificationScore: "Verification Score",
    detailedAnalysis: "Detailed Analysis",
    keyFindings: "Main Findings",
    verifiedSources: "Verified Sources",
    uploadTooltip: "Media Upload Karein",
    recordTooltip: "Audio Record Karein",
    stopRecording: "Recording Rokein",
    recording: "Recording ho rahi hai...",
    removeFile: "File hatayein",
    fileTooLarge: "File bahut badi hai (Max 100MB)",
    supports: "JPG, PNG, MP4, MP3, WAV support karta hai",
    sizeLimit: "Max size: 100MB",
    listenToAnalysis: "Analysis Suno",
    stopAudio: "Audio Roko",
    translateTo: "Result Translate Karein",
    chatAboutAnalysis: "Is result ke baare mein chat karein",
    chatContextIntro: "Main is analysis ke baare mein aur questions answer kar sakta hoon.",
    chatPlaceholder: "Is verdict ke baare mein aur puchein...",
    translating: "Translate ho raha hai...",
    generatingAudio: "Audio ban raha hai...",
    urlTooltip: "Link Add Karein",
    pasteUrl: "URL yahan paste karein...",
    invalidUrl: "Please valid URL dalein (e.g., https://example.com)",
    removeUrl: "Link Hatayein",
    urlDisclaimer: "Kuch links check nahi ho sakte.",
    latestNews: "Latest News",
    newsSubtitle: "Trending stories jo misinformation aur tech se related hain.",
    readMore: "Puri story padhein",
    loadingNews: "Latest news laa rahe hain...",
    loadMoreNews: "Aur News Generate Karein",

    promoTitle: "TathyaSetu ko WhatsApp aur Web Extension par try karein",
    promoSubtitle: "Apne favorite platforms par AI-powered fact checking experience karein. Instant verification ke liye hamara WhatsApp bot ya browser extension use karein.",
    promoWhatsappTitle: "WhatsApp Bot",
    promoWhatsappDesc: "Quick fact checks aur misinformation detection ke liye WhatsApp par TathyaSetu se chat karein.",
    promoExtensionTitle: "Web Extension",
    promoExtensionDesc: "Articles aur social posts ko instantly verify karne ke liye TathyaSetu browser extension use karein.",

    waDemoBtn: "Interactive Demo Try Karein",
    waOnline: "Online",
    waTyping: "typing...",
    waPlaceholder: "Verify karne ke liye kuch likhein...",
    waWelcome: "👋 Hi! Main TathyaSetu hoon. Mujhe koi bhi text ya news forward karein, main turant fact-check karunga.",
    waDisclaimer: "Ye live simulation hai jo Gemini 3 Pro engine use kar raha hai.",
    waComingSoon: "Original Bot jald hi aayega",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "Credible (Sahi)", desc: "Sources ke hisaab se ye content factual lag raha hai." },
      [VerdictType.FALSE]: { label: "False Information (Galat)", desc: "Is content mein galat claims paye gaye hain." },
      [VerdictType.MISLEADING]: { label: "Misleading (Bhramak)", desc: "Ye content misleading ho sakta hai, visuals edited ho sakte hain." },
      [VerdictType.SATIRE]: { label: "Satire (Vyang)", desc: "Ye content mazaak ya vyang hai, fact nahi." },
      [VerdictType.UNVERIFIED]: { label: "Unverified", desc: "Isse verify karne ke liye enough saboot nahi mile." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "Trending",
      india: "India",
      world: "World",
      technology: "Technology",
      business: "Business",
      science: "Science",
      health: "Health",
      sports: "Sports"
    }
  },
  // --- NEW LANGUAGES ---
  bn: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu কেন?",
    news: "খবর",
    more: "আরও",
    getStarted: "শুরু করুন",
    heroTitle: "AI-চালিত ফ্যাক্ট চেকার",
    heroSubtitle: "প্রতিটি ফরম্যাটে এবং প্রতিটি ভারতীয় ভাষায় সব কিছু যাচাই করুন।",
    inputPlaceholder: "যাচাই করার জন্য টেক্সট পেস্ট করুন বা মিডিয়া আপলোড করুন...",
    analyzing: "বিশ্লেষণ করা হচ্ছে...",
    verifyBtn: "তথ্য যাচাই করুন",
    chars: "অক্ষর",
    footer: "Gemini 3 Pro দ্বারা চালিত।",
    loadingMessage: "বিষয়বস্তু বিশ্লেষণ এবং উৎস যাচাই করা হচ্ছে...",
    didYouKnow: "আপনি কি জানেন?",
    errorTitle: "বিশ্লেষণে ত্রুটি",
    shareReport: "রিপোর্ট শেয়ার করুন",
    copied: "কপি করা হয়েছে",
    verificationScore: "যাচাইকরণ স্কোর",
    detailedAnalysis: "বিস্তারিত বিশ্লেষণ",
    keyFindings: "মূল ফলাফল",
    verifiedSources: "যাচাইকৃত উৎস",
    uploadTooltip: "মিডিয়া আপলোড",
    recordTooltip: "অডিও রেকর্ড",
    stopRecording: "রেকর্ডিং বন্ধ করুন",
    recording: "রেকর্ডিং হচ্ছে...",
    removeFile: "ফাইল সরান",
    fileTooLarge: "ফাইলটি খুব বড়",
    supports: "JPG, PNG, MP4, MP3, WAV সমর্থন করে",
    sizeLimit: "সর্বাধিক আকার: 100MB",
    listenToAnalysis: "বিশ্লেষণ শুনুন",
    stopAudio: "অডিও বন্ধ করুন",
    translateTo: "ফলাফল অনুবাদ করুন",
    chatAboutAnalysis: "এই ফলাফল সম্পর্কে AI-এর সাথে চ্যাট করুন",
    chatContextIntro: "আমি এই বিশ্লেষণ সম্পর্কে আপনার প্রশ্নের উত্তর দিতে পারি।",
    chatPlaceholder: "আরও বিস্তারিত জানতে চান...",
    translating: "অনুবাদ করা হচ্ছে...",
    generatingAudio: "অডিও তৈরি করা হচ্ছে...",
    urlTooltip: "লিঙ্ক যোগ করুন",
    pasteUrl: "URL পেস্ট করুন...",
    invalidUrl: "অনুগ্রহ করে একটি বৈধ URL দিন",
    removeUrl: "লিঙ্ক সরান",
    urlDisclaimer: "কিছু লিঙ্ক পরীক্ষা করা নাও যেতে পারে।",
    latestNews: "সর্বশেষ খবর",
    newsSubtitle: "ভুল তথ্য এবং প্রযুক্তি সম্পর্কিত ট্রেন্ডিং খবর।",
    readMore: "পুরো খবর পড়ুন",
    loadingNews: "খবর লোড করা হচ্ছে...",
    loadMoreNews: "আরও খবর",
    
    promoTitle: "WhatsApp এবং ওয়েব এক্সটেনশনে TathyaSetu চেষ্টা করুন",
    promoSubtitle: "আপনার প্রিয় প্ল্যাটফর্মে AI-চালিত ফ্যাক্ট চেকিংয়ের অভিজ্ঞতা নিন।",
    promoWhatsappTitle: "WhatsApp বট",
    promoWhatsappDesc: "দ্রুত ফ্যাক্ট চেক এবং ভুল তথ্য সনাক্তকরণের জন্য WhatsApp-এ চ্যাট করুন।",
    promoExtensionTitle: "ওয়েব এক্সটেনশন",
    promoExtensionDesc: "নিবন্ধ এবং সামাজিক পোস্ট অবিলম্বে যাচাই করতে এক্সটেনশন ব্যবহার করুন।",

    waDemoBtn: "ইন্টারঅ্যাক্টিভ ডেমো",
    waOnline: "অনলাইন",
    waTyping: "টাইপ করছে...",
    waPlaceholder: "যাচাই করার জন্য লিখুন...",
    waWelcome: "👋 হাই! আমি TathyaSetu। আমাকে কোনো টেক্সট বা খবর পাঠান।",
    waDisclaimer: "এটি একটি লাইভ সিমুলেশন।",
    waComingSoon: "বট শীঘ্রই আসছে",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "বিশ্বাসযোগ্য", desc: "উপলব্ধ তথ্যের ভিত্তিতে এটি সঠিক বলে মনে হচ্ছে।" },
      [VerdictType.FALSE]: { label: "মিথ্যা তথ্য", desc: "এই বিষয়বস্তুতে মিথ্যা দাবি রয়েছে।" },
      [VerdictType.MISLEADING]: { label: "বিভ্রান্তিকর", desc: "এই তথ্য বিভ্রান্তিকর হতে পারে।" },
      [VerdictType.SATIRE]: { label: "ব্যঙ্গাত্মক", desc: "এটি ব্যঙ্গাত্মক, সত্য নয়।" },
      [VerdictType.UNVERIFIED]: { label: "যাচাই করা হয়নি", desc: "যাচাই করার জন্য পর্যাপ্ত প্রমাণ নেই।" }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ট্রেন্ডिंग",
      india: "ভারত",
      world: "বিশ্ব",
      technology: "প্রযুক্তি",
      business: "ব্যবসা",
      science: "বিজ্ঞান",
      health: "স্বাস্থ্য",
      sports: "খেলাধুলা"
    }
  },
  te: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu ఎందుకు?",
    news: "వార్తలు",
    more: "మరిన్ని",
    getStarted: "ప్రారంభించండి",
    heroTitle: "AI-ఆధారిత ఫాక్ట్ చెకర్",
    heroSubtitle: "ప్రతి ఫార్మాట్ మరియు ప్రతి భారతీయ భాషలో ప్రతిదీ ధృవీకరించండి.",
    inputPlaceholder: "టెక్స్ట్‌ని ఇక్కడ పేస్ట్ చేయండి లేదా మీడియాను అప్‌లోడ్ చేయండి...",
    analyzing: "విశ్లేషించబడుతోంది...",
    verifyBtn: "వాస్తవాలను తనిఖీ చేయండి",
    chars: "అక్షరాలు",
    footer: "Gemini 3 Pro ద్వారా ఆధారితం.",
    loadingMessage: "కంటెంట్ విశ్లేషణ మరియు మూలాల ధృవీకరణ...",
    didYouKnow: "మీకు తెలుసా?",
    errorTitle: "విశ్లేషణలో లోపం",
    shareReport: "నివేదికను షేర్ చేయండి",
    copied: "కాపీ చేయబడింది",
    verificationScore: "ధృవీకరణ స్కోరు",
    detailedAnalysis: "వివరణాత్మక విశ్లేషణ",
    keyFindings: "ముఖ్య ఫలితాలు",
    verifiedSources: "ధృవీకరించబడిన మూలాలు",
    uploadTooltip: "మీడియా అప్‌లోడ్",
    recordTooltip: "ఆడియో రికార్డ్",
    stopRecording: "రికార్డింగ్ ఆపు",
    recording: "రికార్డింగ్...",
    removeFile: "ఫైల్‌ను తొలగించు",
    fileTooLarge: "ఫైల్ చాలా పెద్దది",
    supports: "JPG, PNG, MP4, MP3, WAV మద్దతు ఉంది",
    sizeLimit: "గరిష్ట పరిమాణం: 100MB",
    listenToAnalysis: "విశ్లేషణ వినండి",
    stopAudio: "ఆడియో ఆపు",
    translateTo: "ఫలితాన్ని అనువదించండి",
    chatAboutAnalysis: "ఈ ఫలితం గురించి AIతో చాట్ చేయండి",
    chatContextIntro: "నేను ఈ విశ్లేషణ గురించి మీ ప్రశ్నలకు సమాధానం ఇవ్వగలను.",
    chatPlaceholder: "మరిన్ని వివరాలు అడగండి...",
    translating: "అనువదించబడుతోంది...",
    generatingAudio: "ఆడియో రూపొందించబడుతోంది...",
    urlTooltip: "లింక్ జోడించు",
    pasteUrl: "URLని పేస్ట్ చేయండి...",
    invalidUrl: "సరైన URLని నమోదు చేయండి",
    removeUrl: "లింక్ తొలగించు",
    urlDisclaimer: "కొన్ని లింక్‌లు తనిఖీ చేయబడకపోవచ్చు.",
    latestNews: "తాజా వార్తలు",
    newsSubtitle: "తప్పుడు సమాచారం మరియు సాంకేతికతకు సంబంధించిన ట్రెండింగ్ కథనాలు.",
    readMore: "పూర్తి కథనాన్ని చదవండి",
    loadingNews: "వార్తలు లోడ్ అవుతున్నాయి...",
    loadMoreNews: "మరిన్ని వార్తలు",
    
    promoTitle: "WhatsApp మరియు వెబ్ ఎక్స్‌టెన్షన్‌లో TathyaSetuని ప్రయత్నించండి",
    promoSubtitle: "మీకు ఇష్టమైన ప్లాట్‌ఫారమ్‌లలో AI-ఆధారిత ఫాక్ట్ చెకింగ్‌ను అనుభవించండి.",
    promoWhatsappTitle: "WhatsApp బాట్",
    promoWhatsappDesc: "తక్షణ ఫాక్ట్ చెక్‌ల కోసం WhatsAppలో TathyaSetuతో చాట్ చేయండి.",
    promoExtensionTitle: "వెబ్ ఎక్స్‌టెన్షన్",
    promoExtensionDesc: "కథనాలను తక్షణమే ధృవీకరించడానికి ఎక్స్‌టెన్షన్‌ను ఉపయోగించండి.",

    waDemoBtn: "ఇంటరాక్టివ్ డెమో",
    waOnline: "ఆన్‌లైన్",
    waTyping: "టైప్ చేస్తున్నారు...",
    waPlaceholder: "ధృవీకరించడానికి టైప్ చేయండి...",
    waWelcome: "👋 హాయ్! నేను TathyaSetu. ఏదైనా వార్తను నాకు పంపండి.",
    waDisclaimer: "ఇది లైవ్ సిమ్యులేషన్.",
    waComingSoon: "బాట్ త్వరలో వస్తుంది",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "విశ్వసనీయమైనది", desc: "అందుబాటులో ఉన్న మూలాల ఆధారంగా ఇది ఖచ్చితమైనదిగా కనిపిస్తోంది." },
      [VerdictType.FALSE]: { label: "తప్పుడు సమాచారం", desc: "ఇందులో నిరూపితమైన తప్పుడు వాదనలు ఉన్నాయి." },
      [VerdictType.MISLEADING]: { label: "తప్పుదోవ పట్టించేది", desc: "ఇది తప్పుదోవ పట్టించే అవకాశం ఉంది." },
      [VerdictType.SATIRE]: { label: "వ్యంగ్యం", desc: "ఇది వాస్తవం కాదు, వ్యంగ్యం." },
      [VerdictType.UNVERIFIED]: { label: "ధృవీకరించబడలేదు", desc: "దీనిని ధృవీకరించడానికి తగిన ఆధారాలు లేవు." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ట్రెండింగ్",
      india: "భారతదేశం",
      world: "ప్రపంచం",
      technology: "సాంకేతికత",
      business: "వ్యాపారం",
      science: "సైన్స్",
      health: "ఆరోగ్యం",
      sports: "క్రీడలు"
    }
  },
  ta: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu ஏன்?",
    news: "செய்திகள்",
    more: "மேலும்",
    getStarted: "தொடங்குங்கள்",
    heroTitle: "AI-இயங்கும் உண்மை சரிபார்ப்பு",
    heroSubtitle: "எல்லா வடிவங்களிலும் எல்லா இந்திய மொழிகளிலும் சரிபார்க்கவும்.",
    inputPlaceholder: "உரையை இங்கே ஒட்டவும் அல்லது மீடியாவை பதிவேற்றவும்...",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    verifyBtn: "உண்மையைச் சரிபார்",
    chars: "எழுத்துக்கள்",
    footer: "Gemini 3 Pro மூலம் இயக்கப்படுகிறது.",
    loadingMessage: "உள்ளடக்கம் மற்றும் ஆதாரங்களை சரிபார்க்கிறது...",
    didYouKnow: "உங்களுக்குத் தெரியுமா?",
    errorTitle: "பிழை",
    shareReport: "பகிர்",
    copied: "நகலெடுக்கப்பட்டது",
    verificationScore: "சரிபார்ப்பு மதிப்பெண்",
    detailedAnalysis: "விரிவான பகுப்பாய்வு",
    keyFindings: "முக்கிய முடிவுகள்",
    verifiedSources: "சரிபார்க்கப்பட்ட ஆதாரங்கள்",
    uploadTooltip: "மீடியா பதிவேற்றம்",
    recordTooltip: "ஆடியோ பதிவு",
    stopRecording: "நிறுத்து",
    recording: "பதிவாகிறது...",
    removeFile: "கோப்பை நீக்கு",
    fileTooLarge: "கோப்பு மிகப்பெரியது",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "அதிகபட்ச அளவு: 100MB",
    listenToAnalysis: "பகுப்பாய்வைக் கேளுங்கள்",
    stopAudio: "நிறுத்து",
    translateTo: "மொழிபெயர்",
    chatAboutAnalysis: "AI உடன் அரட்டை",
    chatContextIntro: "இந்த பகுப்பாய்வு பற்றி நான் பதிலளிக்க முடியும்.",
    chatPlaceholder: "மேலும் கேட்கவும்...",
    translating: "மொழிபெயர்க்கிறது...",
    generatingAudio: "ஆடியோ உருவாகிறது...",
    urlTooltip: "இணைப்பைச் சேர்",
    pasteUrl: "URL ஐ ஒட்டவும்...",
    invalidUrl: "சரியான URL ஐ உள்ளிடவும்",
    removeUrl: "இணைப்பை நீக்கு",
    urlDisclaimer: "சில இணைப்புகளைச் சரிபார்க்க முடியாமல் போகலாம்.",
    latestNews: "சமீபத்திய செய்திகள்",
    newsSubtitle: "தவறான தகவல் தொடர்பான செய்திகள்.",
    readMore: "மேலும் படிக்க",
    loadingNews: "செய்திகள் வருகிறது...",
    loadMoreNews: "மேலும் செய்திகள்",
    
    promoTitle: "WhatsApp மற்றும் நீட்டிப்பில் TathyaSetu",
    promoSubtitle: "AI உண்மை சரிபார்ப்பை அனுபவிக்கவும்.",
    promoWhatsappTitle: "WhatsApp பாட்",
    promoWhatsappDesc: "WhatsApp இல் TathyaSetu உடன் அரட்டை அடிக்கவும்.",
    promoExtensionTitle: "உலாவியில்",
    promoExtensionDesc: "உடனடியாக சரிபார்க்கவும்.",

    waDemoBtn: "டெமோவை முயற்சிக்கவும்",
    waOnline: "ஆன்லைன்",
    waTyping: "தட்டச்சு செய்கிறது...",
    waPlaceholder: "சரிபார்க்கவும்...",
    waWelcome: "👋 வணக்கம்! நான் TathyaSetu. எனக்கு ஒரு செய்தியை அனுப்புங்கள்.",
    waDisclaimer: "இது ஒரு சிமுலேஷன்.",
    waComingSoon: "விரைவில் வரும்",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "நம்பகமானது", desc: "இது உண்மையானது என்று தெரிகிறது." },
      [VerdictType.FALSE]: { label: "தவறான தகவல்", desc: "இது பொய்யானது." },
      [VerdictType.MISLEADING]: { label: "வழிகெடுக்கிறது", desc: "இது தவறாக வழிநடத்தலாம்." },
      [VerdictType.SATIRE]: { label: "நகைச்சுவை", desc: "இது உண்மை அல்ல, நகைச்சுவை." },
      [VerdictType.UNVERIFIED]: { label: "சரிபார்க்கப்படவில்லை", desc: "போதுமான ஆதாரம் இல்லை." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ட்ரெண்டிங்",
      india: "இந்தியா",
      world: "உலகம்",
      technology: "தொழில்நுட்பம்",
      business: "வணிகம்",
      science: "அறிவியல்",
      health: "சுகாதாரம்",
      sports: "விளையாட்டு"
    }
  },
  mr: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu का?",
    news: "बातम्या",
    more: "अधिक",
    getStarted: "सुरू करा",
    heroTitle: "AI-आधारित फॅक्ट चेकर",
    heroSubtitle: "प्रत्येक स्वरूपात आणि प्रत्येक भारतीय भाषेत सत्यता तपासा.",
    inputPlaceholder: "येथे मजकूर पेस्ट करा किंवा मीडिया अपलोड करा...",
    analyzing: "विश्लेषण करत आहे...",
    verifyBtn: "तथ्यों की पुष्टि करें",
    chars: "अक्षरे",
    footer: "Gemini 3 Pro द्वारे समर्थित.",
    loadingMessage: "मजकूर आणि स्त्रोत तपासत आहे...",
    didYouKnow: "तुम्हाला माहित आहे का?",
    errorTitle: "त्रुटी",
    shareReport: "रिपोर्ट शेअर करा",
    copied: "कॉपी केले",
    verificationScore: "सत्यापन गुण",
    detailedAnalysis: "सविस्तर विश्लेषण",
    keyFindings: "मुख्य निष्कर्ष",
    verifiedSources: "सत्यापित स्त्रोत",
    uploadTooltip: "मीडिया अपलोड",
    recordTooltip: "ऑडिओ रेकॉर्ड",
    stopRecording: "थांबवा",
    recording: "रेकॉर्डिंग...",
    removeFile: "काढून टाका",
    fileTooLarge: "फाईल खूप मोठी आहे",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "कमाल आकार: 100MB",
    listenToAnalysis: "विश्लेषण ऐका",
    stopAudio: "थांबवा",
    translateTo: "भाषांतर करा",
    chatAboutAnalysis: "AI सह चॅट करा",
    chatContextIntro: "मी या विश्लेषणाबद्दल प्रश्नांची उत्तरे देऊ शकतो.",
    chatPlaceholder: "अधिक विचारा...",
    translating: "भाषांतर होत आहे...",
    generatingAudio: "ऑडिओ तयार होत आहे...",
    urlTooltip: "लिंक जोडा",
    pasteUrl: "URL पेस्ट करा...",
    invalidUrl: "वैध URL प्रविष्ट करा",
    removeUrl: "लिंक काढा",
    urlDisclaimer: "काही लिंक्स तपासल्या जाऊ शकत नाहीत.",
    latestNews: "ताज्या बातम्या",
    newsSubtitle: "चुकीच्या माहितीशी संबंधित बातम्या.",
    readMore: "पूर्ण वाचा",
    loadingNews: "बातम्या लोड होत आहेत...",
    loadMoreNews: "आणखी बातम्या",
    
    promoTitle: "WhatsApp आणि एक्स्टेंशनवर TathyaSetu वापरा",
    promoSubtitle: "तुमच्या आवडत्या प्लॅटफॉर्मवर AI फॅक्ट चेकिंगचा अनुभव घ्या.",
    promoWhatsappTitle: "WhatsApp बोट",
    promoWhatsappDesc: "त्वरित फॅक्ट चेकसाठी WhatsApp वर चॅट करा.",
    promoExtensionTitle: "वेब एक्स्टेंशन",
    promoExtensionDesc: "बातम्या आणि पोस्ट त्वरित तपासा.",

    waDemoBtn: "डेमो वापरून पहा",
    waOnline: "ऑनलाइन",
    waTyping: "टाइप करत आहे...",
    waPlaceholder: "तपासण्यासाठी लिहा...",
    waWelcome: "👋 नमस्कार! मी TathyaSetu आहे. मला एखादी बातमी पाठवा.",
    waDisclaimer: "हे एक सिम्युलेशन आहे.",
    waComingSoon: "लवकरच येत आहे",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "विश्वसनीय", desc: "उपलब्ध स्त्रोतांवर आधारित हे सत्य वाटत आहे." },
      [VerdictType.FALSE]: { label: "चुकीची माहिती", desc: "यात चुकीचे दावे आहेत." },
      [VerdictType.MISLEADING]: { label: "दिशाभूल करणारे", desc: "हे दिशाभूल करू शकते." },
      [VerdictType.SATIRE]: { label: "उपहासात्मक", desc: "हे उपहासात्मक आहे, सत्य नाही." },
      [VerdictType.UNVERIFIED]: { label: "असत्यापित", desc: "पुरेशी माहिती उपलब्ध नाही." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ट्रेंडिंग",
      india: "भारत",
      world: "जग",
      technology: "तंत्रज्ञान",
      business: "व्यवसाय",
      science: "विज्ञान",
      health: "आरोग्य",
      sports: "क्रीडा"
    }
  },
  gu: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu શા માટે?",
    news: "સમાચાર",
    more: "વધુ",
    getStarted: "શરૂ કરો",
    heroTitle: "AI-સંચાલિત ફેક્ટ ચેકર",
    heroSubtitle: "દરેક ફોર્મેટ અને ભારતીય ભાષામાં ચકાસણી કરો.",
    inputPlaceholder: "ટેક્સ્ટ અહીં પેસ્ટ કરો અથવા મીડિયા અપલોડ કરો...",
    analyzing: "વિશ્લેષણ થઈ રહ્યું છે...",
    verifyBtn: "તથ્યો તપાસો",
    chars: "અક્ષરો",
    footer: "Gemini 3 Pro દ્વારા સંચાલિત.",
    loadingMessage: "ચકાસણી થઈ રહી છે...",
    didYouKnow: "શું તમે જાણો છો?",
    errorTitle: "ભૂલ",
    shareReport: "શેર કરો",
    copied: "કોપી કર્યું",
    verificationScore: "ચકાસણી સ્કોર",
    detailedAnalysis: "વિગતવાર વિશ્લેષણ",
    keyFindings: "મુખ્ય તારણો",
    verifiedSources: "ચકાસાયેલ સ્ત્રોતો",
    uploadTooltip: "મીડિયા અપલોડ",
    recordTooltip: "ઓડિયો રેકોર્ડ",
    stopRecording: "રોકો",
    recording: "રેકોર્ડિંગ...",
    removeFile: "દૂર કરો",
    fileTooLarge: "ફાઇલ ખૂબ મોટી છે",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "મહત્તમ કદ: 100MB",
    listenToAnalysis: "સાંભળો",
    stopAudio: "રોકો",
    translateTo: "અનુવાદ કરો",
    chatAboutAnalysis: "AI સાથે ચેટ કરો",
    chatContextIntro: "હું આ વિશ્લેષણ વિશે જવાબ આપી શકું છું.",
    chatPlaceholder: "વધુ પૂછો...",
    translating: "અનુવાદ થઈ રહ્યો છે...",
    generatingAudio: "ઓડિયો બની રહ્યો છે...",
    urlTooltip: "લિંક ઉમેરો",
    pasteUrl: "URL પેસ્ટ કરો...",
    invalidUrl: "માન્ય URL દાખલ કરો",
    removeUrl: "લિંક દૂર કરો",
    urlDisclaimer: "કેટલીક લિંક્સ તપાસી શકાતી નથી.",
    latestNews: "તાજા સમાચાર",
    newsSubtitle: "ખોટી માહિતી સંબંધિત સમાચાર.",
    readMore: "વધુ વાંચો",
    loadingNews: "સમાચાર લાવી રહ્યું છે...",
    loadMoreNews: "વધુ સમાચાર",
    
    promoTitle: "WhatsApp અને એક્સ્ટેંશન પર TathyaSetu",
    promoSubtitle: "AI ફેક્ટ ચેકિંગનો અનુભવ કરો.",
    promoWhatsappTitle: "WhatsApp બોટ",
    promoWhatsappDesc: "ઝડપી તપાસ માટે WhatsApp પર ચેટ કરો.",
    promoExtensionTitle: "વેબ એક્સ્ટેંશન",
    promoExtensionDesc: "તરત જ ચકાસણી કરો.",

    waDemoBtn: "ડેમો અજમાવો",
    waOnline: "ઓનલાઇન",
    waTyping: "ટાઇપ કરી રહ્યું છે...",
    waPlaceholder: "ચકાસવા માટે લખો...",
    waWelcome: "👋 નમસ્તે! હું TathyaSetu છું. મને સમાચાર મોકલો.",
    waDisclaimer: "આ એક સિમ્યુલેશન છે.",
    waComingSoon: "જલ્દી આવી રહ્યું છે",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "વિશ્વસનીય", desc: "આ સાચું લાગે છે." },
      [VerdictType.FALSE]: { label: "ખોટી માહિતી", desc: "આ ખોટું છે." },
      [VerdictType.MISLEADING]: { label: "ગેરમાર્ગે દોરતું", desc: "આ ગેરમાર્ગે દોરી શકે છે." },
      [VerdictType.SATIRE]: { label: "વ્યંગ", desc: "આ સત્ય નથી." },
      [VerdictType.UNVERIFIED]: { label: "અચકાસાયેલ", desc: "પૂરતા પુરાવા નથી." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ટ્રેન્ડિંગ",
      india: "ભારત",
      world: "વિશ્વ",
      technology: "ટેકનોલોજી",
      business: "બિઝનેસ",
      science: "વિજ્ઞાન",
      health: "સ્વાસ્થ્ય",
      sports: "સ્પોર્ટ્સ"
    }
  },
  kn: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu ಏಕೆ?",
    news: "ಸುದ್ದಿ",
    more: "ಹೆಚ್ಚು",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    heroTitle: "AI-ಚಾಲಿತ ಫ್ಯಾಕ್ಟ್ ಚೆಕರ್",
    heroSubtitle: "ಎಲ್ಲಾ ಸ್ವರೂಪಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.",
    inputPlaceholder: "ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ ಅಥವಾ ಮೀಡಿಯಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    verifyBtn: "ಪರಿಶೀಲಿಸಿ",
    chars: "ಅಕ್ಷರಗಳು",
    footer: "Gemini 3 Pro ನಿಂದ ಚಾಲಿತ.",
    loadingMessage: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    didYouKnow: "ನಿಮಗೆ ತಿಳಿದಿದೆಯೇ?",
    errorTitle: "ದೋಷ",
    shareReport: "ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ",
    copied: "ನಕಲಿಸಲಾಗಿದೆ",
    verificationScore: "ಪರಿಶೀಲನಾ ಸ್ಕೋರ್",
    detailedAnalysis: "ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ",
    keyFindings: "ಮುಖ್ಯ ಅಂಶಗಳು",
    verifiedSources: "ಪರಿಶೀಲಿಸಿದ ಮೂಲಗಳು",
    uploadTooltip: "ಅಪ್‌ಲೋಡ್",
    recordTooltip: "ರೆಕಾರ್ಡ್",
    stopRecording: "ನಿಲ್ಲಿಸಿ",
    recording: "ರೆಕಾರ್ಡಿಂಗ್...",
    removeFile: "ತೆಗೆದುಹಾಕಿ",
    fileTooLarge: "ಫೈಲ್ ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "ಗರಿಷ್ಠ ಗಾತ್ರ: 100MB",
    listenToAnalysis: "ಕೇಳಿ",
    stopAudio: "ನಿಲ್ಲಿಸಿ",
    translateTo: "ಅನುವಾದಿಸಿ",
    chatAboutAnalysis: "AI ನೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
    chatContextIntro: "ನಾನು ಉತ್ತರಿಸಬಲ್ಲೆ.",
    chatPlaceholder: "ಹೆಚ್ಚು ಕೇಳಿ...",
    translating: "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
    generatingAudio: "ಆಡಿಯೋ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    urlTooltip: "ಲಿಂಕ್ ಸೇರಿಸಿ",
    pasteUrl: "URL ಅಂಟಿಸಿ...",
    invalidUrl: "ಸರಿಯಾದ URL ನಮೂದಿಸಿ",
    removeUrl: "ಲಿಂಕ್ ತೆಗೆದುಹಾಕಿ",
    urlDisclaimer: "ಕೆಲವು ಲಿಂಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುವುದಿಲ್ಲ.",
    latestNews: "ತಾಜಾ ಸುದ್ದಿ",
    newsSubtitle: "ಸುಳ್ಳು ಸುದ್ದಿಗಳ ಬಗ್ಗೆ.",
    readMore: "ಹೆಚ್ಚು ಓದಿ",
    loadingNews: "ಸುದ್ದಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    loadMoreNews: "ಇನ್ನಷ್ಟು ಸುದ್ದಿ",
    
    promoTitle: "WhatsApp ಮತ್ತು ವಿಸ್ತರಣೆಯಲ್ಲಿ TathyaSetu",
    promoSubtitle: "AI ಪರಿಶೀಲನೆಯನ್ನು ಅನುಭವಿಸಿ.",
    promoWhatsappTitle: "WhatsApp ಬಾಟ್",
    promoWhatsappDesc: "WhatsApp ನಲ್ಲಿ ಚಾಟ್ ಮಾಡಿ.",
    promoExtensionTitle: "ವೆಬ್ ವಿಸ್ತರಣೆ",
    promoExtensionDesc: "ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ.",

    waDemoBtn: "ಡೆಮೊ ಪ್ರಯತ್ನಿಸಿ",
    waOnline: "ಆನ್‌ಲೈನ್",
    waTyping: "ಟೈಪ್ ಮಾಡುತ್ತಿದೆ...",
    waPlaceholder: "ಬರೆಯಿರಿ...",
    waWelcome: "👋 ನಮಸ್ಕಾರ! ನಾನು TathyaSetu. ನನಗೆ ಸುದ್ದಿಯನ್ನು ಕಳುಹಿಸಿ.",
    waDisclaimer: "ಇದು ಸಿಮ್ಯುಲೇಶನ್.",
    waComingSoon: "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "ನಂಬಲರ್ಹ", desc: "ಇದು ನಿಜವೆಂದು ತೋರುತ್ತದೆ." },
      [VerdictType.FALSE]: { label: "ಸುಳ್ಳು ಮಾಹಿತಿ", desc: "ಇದು ಸುಳ್ಳು." },
      [VerdictType.MISLEADING]: { label: "ದಾರಿತಪ್ಪಿಸುವ", desc: "ಇದು ದಾರಿತಪ್ಪಿಸಬಹುದು." },
      [VerdictType.SATIRE]: { label: "ವ್ಯಂಗ್ಯ", desc: "ಇದು ಸತ್ಯವಲ್ಲ." },
      [VerdictType.UNVERIFIED]: { label: "ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ", desc: "ಸಾಕಷ್ಟು ಸಾಕ್ಷ್ಯಗಳಿಲ್ಲ." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ಟ್ರೆಂಡಿಂಗ್",
      india: "ಭಾರತ",
      world: "ಪ್ರಪಂಚ",
      technology: "ತಂತ್ರಜ್ಞಾನ",
      business: "ವ್ಯಾಪಾರ",
      science: "ವಿಜ್ಞಾನ",
      health: "ಆರೋಗ್ಯ",
      sports: "ಕ್ರೀಡೆ"
    }
  },
  ml: {
    appTitle: "TathyaSetu",
    aboutMethodology: "എന്തുകൊണ്ട് TathyaSetu?",
    news: "വാർത്തകൾ",
    more: "കൂടുതൽ",
    getStarted: "തുടങ്ങുക",
    heroTitle: "AI-അധിഷ്ഠിത ഫാക്റ്റ് ചെക്കർ",
    heroSubtitle: "എല്ലാ ഫോർമാറ്റിലും എല്ലാ ഭാഷയിലും പരിശോധിക്കുക.",
    inputPlaceholder: "ടെക്സ്റ്റ് ഇവിടെ നൽകുക...",
    analyzing: "വിശകലനം ചെയ്യുന്നു...",
    verifyBtn: "പരിശോധിക്കുക",
    chars: "അക്ഷരങ്ങൾ",
    footer: "Gemini 3 Pro.",
    loadingMessage: "പരിശോധിക്കുന്നു...",
    didYouKnow: "നിങ്ങൾക്കറിയാമോ?",
    errorTitle: "പിശക്",
    shareReport: "പങ്കിടുക",
    copied: "പകർത്തി",
    verificationScore: "സ്കോർ",
    detailedAnalysis: "വിശദമായ വിശകലനം",
    keyFindings: "പ്രധാന കണ്ടെത്തലുകൾ",
    verifiedSources: "ഉറവിടങ്ങൾ",
    uploadTooltip: "അപ്‌ലോഡ്",
    recordTooltip: "റെക്കോർഡ്",
    stopRecording: "നിർത്തുക",
    recording: "റെക്കോർഡിംഗ്...",
    removeFile: "നീക്കം ചെയ്യുക",
    fileTooLarge: "ഫയൽ വലുതാണ്",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "പരമാവധി വലുപ്പം: 100MB",
    listenToAnalysis: "കേൾക്കൂ",
    stopAudio: "നിർത്തുക",
    translateTo: "വിവർത്തനം",
    chatAboutAnalysis: "AI ചാറ്റ്",
    chatContextIntro: "എനിക്ക് മറുപടി നൽകാൻ കഴിയും.",
    chatPlaceholder: "ചോദിക്കൂ...",
    translating: "വിവർത്തനം ചെയ്യുന്നു...",
    generatingAudio: "ഓഡിയോ...",
    urlTooltip: "ലിങ്ക്",
    pasteUrl: "URL നൽകുക...",
    invalidUrl: "തെറ്റായ URL",
    removeUrl: "നീക്കം ചെയ്യുക",
    urlDisclaimer: "ചില ലിങ്കുകൾ പരിശോധിക്കാൻ കഴിഞ്ഞേക്കില്ല.",
    latestNews: "പുതിയ വാർത്തകൾ",
    newsSubtitle: "വ്യാജ വാർത്തകൾ.",
    readMore: "കൂടുതൽ",
    loadingNews: "ലോഡുചെയ്യുന്നു...",
    loadMoreNews: "കൂടുതൽ",
    
    promoTitle: "WhatsApp-ൽ TathyaSetu",
    promoSubtitle: "AI പരിശോധന.",
    promoWhatsappTitle: "WhatsApp ബോട്ട്",
    promoWhatsappDesc: "ചാറ്റ് ചെയ്യുക.",
    promoExtensionTitle: "എക്സ്റ്റൻഷൻ",
    promoExtensionDesc: "ഉടൻ പരിശോധിക്കുക.",

    waDemoBtn: "ഡെമോ",
    waOnline: "ഓൺലൈൻ",
    waTyping: "ടൈപ്പ് ചെയ്യുന്നു...",
    waPlaceholder: "എഴുതൂ...",
    waWelcome: "👋 ഹായ്! വാർത്ത അയക്കൂ.",
    waDisclaimer: "ഇതൊരു സിമുലേഷൻ ആണ്.",
    waComingSoon: "ഉടൻ വരുന്നു",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "വിശ്വസനീയം", desc: "ഇത് സത്യമാണ്." },
      [VerdictType.FALSE]: { label: "തെറ്റായ വിവരം", desc: "ഇത് തെറ്റാണ്." },
      [VerdictType.MISLEADING]: { label: "തെറ്റിദ്ധരിപ്പിക്കുന്നത്", desc: "ഇത് തെറ്റിദ്ധരിപ്പിക്കുന്നതാണ്." },
      [VerdictType.SATIRE]: { label: "ആക്ഷേപഹാസ്യം", desc: "ഇത് തമാശയാണ്." },
      [VerdictType.UNVERIFIED]: { label: "സ്ഥിരീകരിച്ചിട്ടില്ല", desc: "തെളിവില്ല." }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ട്രെൻഡിംഗ്",
      india: "ഇന്ത്യ",
      world: "ലോകം",
      technology: "സാങ്കേതികവിദ്യ",
      business: "ബിസിനസ്സ്",
      science: "ശാസ്ത്രം",
      health: "ആരോഗ്യം",
      sports: "കായികം"
    }
  },
  pa: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu ਕਿਉਂ?",
    news: "ਖਬਰਾਂ",
    more: "ਹੋਰ",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    heroTitle: "AI ਫੈਕਟ ਚੈਕਰ",
    heroSubtitle: "ਹਰ ਭਾਸ਼ਾ ਵਿੱਚ ਜਾਂਚ ਕਰੋ।",
    inputPlaceholder: "ਟੈਕਸਟ ਇੱਥੇ ਪਾਓ...",
    analyzing: "ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...",
    verifyBtn: "ਤੱਥਾਂ ਦੀ ਜਾਂਚ ਕਰੋ",
    chars: "ਅੱਖਰ",
    footer: "Gemini 3 Pro ਦੁਆਰਾ।",
    loadingMessage: "ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ...",
    didYouKnow: "ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ?",
    errorTitle: "ਗਲਤੀ",
    shareReport: "ਸਾਂਝਾ ਕਰੋ",
    copied: "ਕਾਪੀ ਕੀਤਾ",
    verificationScore: "ਸਕੋਰ",
    detailedAnalysis: "ਵਿਸਤ੍ਰਿਤ ਵਿਸ਼ਲੇਸ਼ਣ",
    keyFindings: "ਮੁੱਖ ਨਤੀਜੇ",
    verifiedSources: "ਸਰੋਤ",
    uploadTooltip: "ਅਪਲੋਡ",
    recordTooltip: "ਰਿਕਾਰਡ",
    stopRecording: "ਰੋਕੋ",
    recording: "ਰਿਕਾਰਡਿੰਗ...",
    removeFile: "ਹਟਾਓ",
    fileTooLarge: "ਫਾਈਲ ਵੱਡੀ ਹੈ",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "ਅਧਿਕਤਮ ਆਕਾਰ: 100MB",
    listenToAnalysis: "ਸੁਣੋ",
    stopAudio: "ਰੋਕੋ",
    translateTo: "ਅਨੁਵਾਦ",
    chatAboutAnalysis: "AI ਨਾਲ ਗੱਲ ਕਰੋ",
    chatContextIntro: "ਮੈਂ ਜਵਾਬ ਦੇ ਸਕਦਾ ਹਾਂ।",
    chatPlaceholder: "ਪੁੱਛੋ...",
    translating: "ਅਨੁਵਾਦ...",
    generatingAudio: "ਆਡੀਓ...",
    urlTooltip: "ਲਿੰਕ",
    pasteUrl: "URL ਪਾਓ...",
    invalidUrl: "ਗਲਤ URL",
    removeUrl: "ਹਟਾਓ",
    urlDisclaimer: "ਕੁਝ ਲਿੰਕ ਚੈੱਕ ਨਹੀਂ ਕੀਤੇ ਜਾ ਸਕਦੇ।",
    latestNews: "ਤਾਜ਼ਾ ਖਬਰਾਂ",
    newsSubtitle: "ਝੂਠੀਆਂ ਖਬਰਾਂ।",
    readMore: "ਹੋਰ ਪੜ੍ਹੋ",
    loadingNews: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    loadMoreNews: "ਹੋਰ ਖਬਰਾਂ",
    
    promoTitle: "WhatsApp 'ਤੇ TathyaSetu",
    promoSubtitle: "AI ਜਾਂਚ।",
    promoWhatsappTitle: "WhatsApp ਬੋਟ",
    promoWhatsappDesc: "ਗੱਲ ਕਰੋ।",
    promoExtensionTitle: "ਵੈੱਬ ਐਕਸਟੈਂਸ਼ਨ",
    promoExtensionDesc: "ਤੁਰੰਤ ਜਾਂਚ।",

    waDemoBtn: "ਡੈਮੋ",
    waOnline: "ਆਨਲਾਈਨ",
    waTyping: "ਟਾਈਪ ਕਰ ਰਿਹਾ ਹੈ...",
    waPlaceholder: "ਲਿਖੋ...",
    waWelcome: "👋 ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਖਬਰ ਭੇਜੋ।",
    waDisclaimer: "ਇਹ ਸਿਮੂਲੇਸ਼ਨ ਹੈ।",
    waComingSoon: "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "ਸਹੀ", desc: "ਇਹ ਸੱਚ ਹੈ।" },
      [VerdictType.FALSE]: { label: "ਗਲਤ", desc: "ਇਹ ਝੂਠ ਹੈ।" },
      [VerdictType.MISLEADING]: { label: "ਗੁੰਮਰਾਹਕੁੰਨ", desc: "ਇਹ ਗੁੰਮਰਾਹ ਕਰਦਾ ਹੈ।" },
      [VerdictType.SATIRE]: { label: "ਵਿਅੰਗ", desc: "ਇਹ ਮਜ਼ਾਕ ਹੈ।" },
      [VerdictType.UNVERIFIED]: { label: "ਅਣਪਛਾਤਾ", desc: "ਪੱਕਾ ਨਹੀਂ।" }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ਟ੍ਰੈਂਡਿੰਗ",
      india: "ਭਾਰਤ",
      world: "ਸੰਸਾਰ",
      technology: "ਤਕਨਾਲੋਜੀ",
      business: "ਵਪਾਰ",
      science: "ਵਿਗਿਆਨ",
      health: "ਸਿਹਤ",
      sports: "ਖੇਡਾਂ"
    }
  },
  ur: {
    appTitle: "TathyaSetu",
    aboutMethodology: "TathyaSetu کیوں؟",
    news: "خبریں",
    more: "مزید",
    getStarted: "شروع کریں",
    heroTitle: "AI فیکٹ چیکر",
    heroSubtitle: "ہر زبان میں تصدیق کریں۔",
    inputPlaceholder: "یہاں لکھیں یا میڈیا اپ لوڈ کریں...",
    analyzing: "تجزیہ ہو رہا ہے...",
    verifyBtn: "تصدیق کریں",
    chars: "حروف",
    footer: "Gemini 3 Pro کے ذریعے",
    loadingMessage: "جانچ پڑتال...",
    didYouKnow: "کیا آپ جانتے ہیں؟",
    errorTitle: "غلطی",
    shareReport: "شیئر کریں",
    copied: "کاپی ہو گیا",
    verificationScore: "تصدیقی اسکور",
    detailedAnalysis: "تفصیلی تجزیہ",
    keyFindings: "اہم نکات",
    verifiedSources: "تصدیق شدہ ذرائع",
    uploadTooltip: "اپ لوڈ",
    recordTooltip: "ریکارڈ",
    stopRecording: "روکیں",
    recording: "ریکارڈنگ...",
    removeFile: "ہٹائیں",
    fileTooLarge: "فائل بڑی ہے",
    supports: "JPG, PNG, MP4, MP3, WAV",
    sizeLimit: "زیادہ سے زیادہ سائز: 100MB",
    listenToAnalysis: "سنیں",
    stopAudio: "روکیں",
    translateTo: "ترجمہ",
    chatAboutAnalysis: "AI سے بات کریں",
    chatContextIntro: "میں جواب دے سکتا ہوں۔",
    chatPlaceholder: "پوچھیں...",
    translating: "ترجمہ...",
    generatingAudio: "آڈیو...",
    urlTooltip: "لنک",
    pasteUrl: "URL پیسٹ کریں...",
    invalidUrl: "غلط URL",
    removeUrl: "ہٹائیں",
    urlDisclaimer: "کچھ لنکس چیک نہیں کیے جا سکتے۔",
    latestNews: "تازہ ترین خبریں",
    newsSubtitle: "جعلی خبریں۔",
    readMore: "مزید پڑھیں",
    loadingNews: "لوڈ ہو رہا ہے...",
    loadMoreNews: "مزید خبریں",
    
    promoTitle: "WhatsApp پر TathyaSetu",
    promoSubtitle: "AI تصدیق۔",
    promoWhatsappTitle: "WhatsApp بوٹ",
    promoWhatsappDesc: "بات کریں۔",
    promoExtensionTitle: "ویب ایکسٹینشن",
    promoExtensionDesc: "فوری جانچ۔",

    waDemoBtn: "ڈیمو",
    waOnline: "آن لائن",
    waTyping: "لکھ رہا ہے...",
    waPlaceholder: "لکھیں...",
    waWelcome: "👋 ہیلو! خبر بھیجیں۔",
    waDisclaimer: "یہ ایک نقلی ہے۔",
    waComingSoon: "جلد آ رہا ہے",

    verdictLabels: {
      [VerdictType.TRUE]: { label: "قابل اعتماد", desc: "یہ سچ ہے۔" },
      [VerdictType.FALSE]: { label: "غلط معلومات", desc: "یہ جھوٹ ہے۔" },
      [VerdictType.MISLEADING]: { label: "گمراہ کن", desc: "یہ گمراہ کن ہے۔" },
      [VerdictType.SATIRE]: { label: "طنز", desc: "یہ مذاق ہے۔" },
      [VerdictType.UNVERIFIED]: { label: "غیر تصدیق شدہ", desc: "ثبوت نہیں ہے۔" }
    },
    modal: enTranslation.modal,
    newsCategories: {
      trending: "ٹرینڈنگ",
      india: "انڈیا",
      world: "دنیا",
      technology: "ٹیکنالوجی",
      business: "کاروبار",
      science: "سائنس",
      health: "صحت",
      sports: "کھیل"
    }
  }
};