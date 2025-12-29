import React, { useState, useEffect, useRef } from 'react';
import { VerdictType, FullAnalysisResponse, Language, GroundingSource } from '../types';
import { TranslationSchema } from '../translations';
import { streamAudio, translateAnalysis, pcmToAudioBuffer } from '../services/gemini';
import { ChatWidget } from './ChatWidget';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  Quote, 
  TrendingUp,
  ShieldAlert,
  Share2,
  Check,
  Volume2,
  Languages,
  MessageCircle,
  Square,
  Loader2,
  ListChecks,
  Info,
  FileSearch,
  Calendar,
  Globe,
  Search
} from 'lucide-react';

interface ResultCardProps {
  data: FullAnalysisResponse;
  t: TranslationSchema;
  currentLanguage: Language;
}

// Helper to check for "Trusted" domains (Government, Education, Major Fact Checkers)
const isTrustedSource = (uri: string) => {
    try {
        const hostname = new URL(uri).hostname;
        return hostname.endsWith('.gov') || 
               hostname.endsWith('.edu') || 
               hostname.endsWith('.nic.in') ||
               hostname.includes('reuters') ||
               hostname.includes('apnews') ||
               hostname.includes('bbc') ||
               hostname.includes('snopes') ||
               hostname.includes('altnews') ||
               hostname.includes('politifact');
    } catch {
        return false;
    }
};

const getVerdictIcon = (verdict: VerdictType, t: TranslationSchema) => {
  const config = t.verdictLabels[verdict];
  
  switch (verdict) {
    case VerdictType.TRUE:
      return {
        theme: 'emerald',
        color: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-900',
        icon: <CheckCircle2 className="w-full h-full text-emerald-600 dark:text-emerald-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.FALSE:
      return {
        theme: 'rose',
        color: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        border: 'border-rose-200 dark:border-rose-900',
        icon: <XCircle className="w-full h-full text-rose-600 dark:text-rose-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.MISLEADING:
      return {
        theme: 'amber',
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-900',
        icon: <AlertTriangle className="w-full h-full text-amber-600 dark:text-amber-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.SATIRE:
      return {
        theme: 'purple',
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-900',
        icon: <Quote className="w-full h-full text-purple-600 dark:text-purple-400" />,
        label: config.label,
        description: config.desc
      };
    default:
      return {
        theme: 'slate',
        color: 'text-slate-700 dark:text-slate-300',
        bg: 'bg-slate-50 dark:bg-slate-900/50',
        border: 'border-slate-200 dark:border-slate-800',
        icon: <HelpCircle className="w-full h-full text-slate-600 dark:text-slate-400" />,
        label: config.label,
        description: config.desc
      };
  }
};

const SourceCard: React.FC<{ source: GroundingSource }> = ({ source }) => {
    const hostname = source.uri ? new URL(source.uri).hostname : '';
    const trusted = source.uri ? isTrustedSource(source.uri) : false;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    return (
        <a 
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 h-full relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <img 
                        src={faviconUrl} 
                        alt="icon" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=google.com";
                        }} 
                    />
                </div>
                <div className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                </div>
            </div>

            <div className="mb-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {source.title || hostname}
                </h4>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between">
                 <span className="text-xs text-slate-500 font-medium truncate max-w-[70%]">
                    {hostname.replace('www.', '')}
                 </span>
                 {trusted && (
                     <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                         <ShieldAlert className="w-3 h-3" />
                         Trusted
                     </span>
                 )}
            </div>
            
            {/* Hover Glow */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-3xl pointer-events-none"></div>
        </a>
    );
};

export const ResultCard: React.FC<ResultCardProps> = ({ data, t, currentLanguage }) => {
  const { sources } = data;
  const [displayedResult, setDisplayedResult] = useState(data.result);
  
  // States for features
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Audio Refs
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStackRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    setDisplayedResult(data.result);
    setShowChat(false);
    stopAudio();
  }, [data.result]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const config = getVerdictIcon(displayedResult.verdict, t);

  const handleCopy = () => {
    const textToShare = `*${t.appTitle} Report*\n\n` +
      `Verdict: *${config.label}* (${displayedResult.confidence}% Confidence)\n\n` +
      `*Summary:* ${displayedResult.summary}\n\n` +
      `*${t.keyFindings}:*\n${displayedResult.keyPoints.map(p => `• ${p}`).join('\n')}\n\n` +
      `Verified via TathyaSetu AI`;
    
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsGeneratingAudio(true);

    try {
      const verdictText = currentLanguage === 'hi' ? 'निष्कर्ष' : 'Verdict';
      const keyPointsText = currentLanguage === 'hi' ? 'मुख्य निष्कर्ष' : 'Key points';
      
      const textToRead = `${verdictText}: ${config.label}. ${displayedResult.summary}. ${keyPointsText}: ${displayedResult.keyPoints.join('. ')}`;
      
      // Init Audio Context without forcing sample rate (browser compatibility)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      // Critical: Resume context if suspended (common in browsers)
      if (ctx.state === 'suspended') {
          await ctx.resume();
      }
      
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime + 0.1; // Start slightly in future
      
      const stream = streamAudio(textToRead, currentLanguage);
      
      for await (const chunk of stream) {
         if (!isPlayingRef.current) break;

         // Pass 24000 explicitly as the source sample rate from Gemini
         const buffer = await pcmToAudioBuffer(chunk, ctx, 24000, 1);
         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.connect(ctx.destination);
         
         // Schedule playback
         if (nextStartTimeRef.current < ctx.currentTime) {
             nextStartTimeRef.current = ctx.currentTime;
         }
         
         source.start(nextStartTimeRef.current);
         nextStartTimeRef.current += buffer.duration;
         
         audioStackRef.current.push(source);
         
         source.onended = () => {
             const idx = audioStackRef.current.indexOf(source);
             if (idx > -1) {
                 audioStackRef.current.splice(idx, 1);
             }
         };
      }

      // Cleanup after playback finishes
      const timeRemaining = (nextStartTimeRef.current - ctx.currentTime);
      if (timeRemaining > 0) {
          setTimeout(() => {
              if (isPlayingRef.current) {
                  stopAudio();
              }
          }, timeRemaining * 1000 + 500);
      } else {
        setIsPlaying(false);
      }

    } catch (e) {
      console.error("Audio playback error:", e);
      alert("Failed to play audio. Please ensure sound is enabled.");
      stopAudio();
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const stopAudio = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    
    // Stop all active sources
    audioStackRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    audioStackRef.current = [];
    
    // Close context to release resources
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }
  };

  const handleTranslate = async (lang: Language) => {
    if (lang === currentLanguage) {
        setDisplayedResult(data.result);
        return;
    }

    setIsTranslating(true);
    try {
        const translated = await translateAnalysis(data.result, lang);
        setDisplayedResult(translated);
    } catch (e) {
        console.error(e);
        alert("Translation failed.");
    } finally {
        setIsTranslating(false);
    }
  };

  const languages: {code: Language, label: string}[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'hinglish', label: 'Hinglish' },
    { code: 'bn', label: 'Bengali' },
    { code: 'te', label: 'Telugu' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'pa', label: 'Punjabi' },
    { code: 'ur', label: 'Urdu' },
  ];

  // Calculate Dash Offset for Circular Progress
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedResult.confidence / 100) * circumference;

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 space-y-8 pb-20 animate-slide-up">
      
      {/* Floating Action Bar */}
      <div className="sticky top-24 z-20 flex justify-end">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-lg border border-slate-200/50 dark:border-slate-700/50 ring-1 ring-black/5">
           {/* Audio Button */}
           <button
              onClick={handlePlayAudio}
              disabled={isGeneratingAudio}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  isPlaying 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900 dark:text-rose-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
           >
              {isGeneratingAudio ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPlaying ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                  <Volume2 className="w-3.5 h-3.5" />
              )}
              {isGeneratingAudio ? t.generatingAudio : isPlaying ? t.stopAudio : t.listenToAnalysis}
           </button>
            
           <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

           {/* Translate Dropdown */}
           <div className="relative group">
              <button
                  disabled={isTranslating}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                  {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                  {isTranslating ? t.translating : t.translateTo}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block scrollbar-thin z-30">
                  {languages.map((lang) => (
                      <button 
                          key={lang.code}
                          onClick={() => handleTranslate(lang.code)} 
                          className="block w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                          {lang.label}
                      </button>
                  ))}
              </div>
           </div>
           
           <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

           {/* Share */}
           <button
             onClick={handleCopy}
             className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
           >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? t.copied : t.shareReport}
           </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Verdict & Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
              <div className={`
                 relative overflow-hidden rounded-[32px] p-8 border ${config.border} ${config.bg}
                 flex flex-col items-center text-center shadow-lg
              `}>
                  {/* Decorative BG Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-5 pointer-events-none">
                      {config.icon}
                  </div>

                  {/* Verdict Icon */}
                  <div className="relative mb-6">
                     <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-full blur-md opacity-50"></div>
                     <div className="relative w-24 h-24 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-white/20 dark:border-white/5 ring-1 ring-black/5">
                        {config.icon}
                     </div>
                     <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm border-4 border-white dark:border-slate-900 shadow-sm">
                        AI
                     </div>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Verdict</span>
                  <h2 className={`text-4xl font-black tracking-tight mb-2 ${config.color}`}>{config.label}</h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 px-4">{config.description}</p>

                  {/* Confidence Ring */}
                  <div className="mt-8 flex flex-col items-center">
                      <div className="relative w-24 h-24">
                          <svg className="w-full h-full transform -rotate-90">
                             <circle
                               cx="48"
                               cy="48"
                               r={radius}
                               fill="transparent"
                               stroke="currentColor"
                               strokeWidth="6"
                               className="text-black/5 dark:text-white/5"
                             />
                             <circle
                               cx="48"
                               cy="48"
                               r={radius}
                               fill="transparent"
                               stroke="currentColor"
                               strokeWidth="6"
                               strokeDasharray={circumference}
                               strokeDashoffset={strokeDashoffset}
                               strokeLinecap="round"
                               className={`${config.color} transition-all duration-1000 ease-out`}
                             />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-xl font-bold ${config.color}`}>{displayedResult.confidence}%</span>
                          </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">{t.verificationScore}</span>
                  </div>
              </div>

              {/* Chat CTA */}
               {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="w-full p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl shadow-lg group hover:-translate-y-1 transition-transform"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-[22px] p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                              <MessageCircle className="w-6 h-6" />
                           </div>
                           <div className="text-left">
                               <div className="font-bold text-slate-900 dark:text-white">{t.chatAboutAnalysis}</div>
                               <div className="text-xs text-slate-500 dark:text-slate-400">Ask follow-up questions</div>
                           </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Info className="w-4 h-4" />
                        </div>
                    </div>
                </button>
             )}
          </div>

          {/* Right Column: Details & Sources (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full"></div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                       <ShieldAlert className="w-5 h-5 text-indigo-500" />
                       Analysis Summary
                   </h3>
                   <p className="text-xl md:text-2xl leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                       "{displayedResult.summary}"
                   </p>
              </div>

               {/* Existing Fact Checks Section (Google Fact Check Style) */}
               {displayedResult.existingFactChecks && displayedResult.existingFactChecks.length > 0 && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50">
                     <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                         <FileSearch className="w-4 h-4" />
                         Fact Check Database
                     </h3>
                     <div className="space-y-4">
                        {displayedResult.existingFactChecks.map((fc, i) => (
                           <a key={i} href={fc.url} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shadow-sm group">
                              <div className="flex justify-between items-start mb-2">
                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">
                                      {fc.factCheckerName.charAt(0)}
                                    </span>
                                    {fc.factCheckerName}
                                 </div>
                                 <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    {fc.date}
                                 </div>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm">
                                " {fc.claim} "
                              </h4>
                              <div className="flex items-center gap-3">
                                 <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Claim by <span className="font-semibold text-slate-700 dark:text-slate-300">{fc.claimant}</span>
                                 </div>
                                 <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                    Rating: <span className="text-indigo-600 dark:text-indigo-400">{fc.rating}</span>
                                 </div>
                              </div>
                           </a>
                        ))}
                     </div>
                  </div>
               )}

              {/* Key Findings */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                       <ListChecks className="w-4 h-4" />
                       {t.keyFindings}
                   </h3>
                   <div className="space-y-4">
                      {displayedResult.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-4">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                                {idx + 1}
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{point}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.detailedAnalysis}</h4>
                       <p className="text-slate-600 dark:text-slate-400 text-sm leading-7">
                           {displayedResult.detailedAnalysis}
                       </p>
                   </div>
              </div>

              {/* Improvised Sources Section */}
              <div>
                 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 pl-2">
                    <Globe className="w-4 h-4" />
                    {t.verifiedSources} ({sources.length})
                 </h3>
                 <div className="grid sm:grid-cols-2 gap-3">
                    {sources && sources.length > 0 ? sources.map((source, idx) => (
                        <SourceCard key={idx} source={source} />
                    )) : (
                        <div className="col-span-full p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
                             <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 text-slate-400">
                                <Search className="w-6 h-6" />
                             </div>
                             <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No specific web sources cited in metadata.</p>
                             <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">The AI used its internal knowledge base or the search results didn't return direct links for this specific query.</p>
                        </div>
                    )}
                 </div>
              </div>
          </div>
      </div>

      {/* Contextual Chat Section (Expandable) */}
      {showChat && (
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up ring-4 ring-indigo-500/10">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {t.chatAboutAnalysis}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">AI Assistant • Context Aware</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                 >
                    <XCircle className="w-6 h-6" />
                 </button>
            </div>
            <div className="p-6 bg-slate-50/30 dark:bg-black/20 h-[500px]">
                <ChatWidget t={t} language={currentLanguage} analysisContext={data.result} />
            </div>
        </div>
      )}
    </div>
  );
}