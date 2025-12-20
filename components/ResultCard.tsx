import React, { useState, useEffect, useRef } from 'react';
import { VerdictType, FullAnalysisResponse, Language } from '../types';
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
  ArrowRight,
  Share2,
  Check,
  Volume2,
  Languages,
  MessageCircle,
  Square,
  Loader2
} from 'lucide-react';

interface ResultCardProps {
  data: FullAnalysisResponse;
  t: TranslationSchema;
  currentLanguage: Language;
}

const getVerdictIcon = (verdict: VerdictType, t: TranslationSchema) => {
  const config = t.verdictLabels[verdict];
  
  switch (verdict) {
    case VerdictType.TRUE:
      return {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-900',
        badgeBorder: 'border-green-200 dark:border-green-800',
        badgeBg: 'bg-white/60 dark:bg-black/20',
        icon: <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.FALSE:
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-200 dark:border-red-900',
        badgeBorder: 'border-red-200 dark:border-red-800',
        badgeBg: 'bg-white/60 dark:bg-black/20',
        icon: <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.MISLEADING:
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-900',
        badgeBorder: 'border-orange-200 dark:border-orange-800',
        badgeBg: 'bg-white/60 dark:bg-black/20',
        icon: <AlertTriangle className="w-12 h-12 text-orange-600 dark:text-orange-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.SATIRE:
      return {
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: 'border-purple-200 dark:border-purple-900',
        badgeBorder: 'border-purple-200 dark:border-purple-800',
        badgeBg: 'bg-white/60 dark:bg-black/20',
        icon: <Quote className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
        label: config.label,
        description: config.desc
      };
    default:
      return {
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-900',
        borderColor: 'border-slate-200 dark:border-slate-800',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
        badgeBg: 'bg-white/60 dark:bg-black/20',
        icon: <HelpCircle className="w-12 h-12 text-slate-600 dark:text-slate-400" />,
        label: config.label,
        description: config.desc
      };
  }
};

export const ResultCard: React.FC<ResultCardProps> = ({ data, t, currentLanguage }) => {
  const { sources } = data;
  
  // State for displayed analysis (might change if translated)
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

  // Update displayed result if prop data changes significantly (new analysis)
  useEffect(() => {
    setDisplayedResult(data.result);
    // Reset states on new analysis
    setShowChat(false);
    stopAudio();
  }, [data.result]);

  // Clean up audio on unmount
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
      
      // Initialize Audio Context (Sample rate 24000 for Gemini TTS)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({sampleRate: 24000});
      audioContextRef.current = ctx;
      
      // Stream Audio using Gemini
      const stream = streamAudio(textToRead, currentLanguage);
      let nextStartTime = ctx.currentTime + 0.1; // Small buffer
      
      for await (const chunk of stream) {
         if (!isPlayingRef.current) break;

         // Convert raw PCM to AudioBuffer
         const buffer = await pcmToAudioBuffer(chunk, ctx, 24000, 1);
         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.connect(ctx.destination);
         
         if (nextStartTime < ctx.currentTime) nextStartTime = ctx.currentTime;
         
         source.start(nextStartTime);
         nextStartTime += buffer.duration;
         
         audioStackRef.current.push(source);
         
         source.onended = () => {
             const idx = audioStackRef.current.indexOf(source);
             if (idx > -1) {
                 audioStackRef.current.splice(idx, 1);
             }
         };
      }

      // Auto-stop when playback finishes naturally
      const timeRemaining = (nextStartTime - ctx.currentTime);
      if (timeRemaining > 0) {
          setTimeout(() => {
              if (isPlayingRef.current) {
                  stopAudio();
              }
          }, timeRemaining * 1000 + 200);
      }

    } catch (e) {
      console.error(e);
      alert("Failed to generate or play audio.");
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
    
    // Close context
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }
  };

  const handleTranslate = async (lang: Language) => {
    if (lang === currentLanguage) {
        // Revert to original if same language selected
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

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-slide-up space-y-6 pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2">
         {/* Audio Button */}
         <button
            onClick={handlePlayAudio}
            disabled={isGeneratingAudio}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                isPlaying 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
         >
            {isGeneratingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
                <Square className="w-4 h-4 fill-current" />
            ) : (
                <Volume2 className="w-4 h-4" />
            )}
            {isGeneratingAudio ? t.generatingAudio : isPlaying ? t.stopAudio : t.listenToAnalysis}
         </button>

         {/* Translate Dropdown */}
         <div className="relative group">
            <button
                disabled={isTranslating}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                {isTranslating ? t.translating : t.translateTo}
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block z-20">
                {languages.map((lang) => (
                    <button 
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)} 
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {/* Main Verdict Card */}
      <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-8 shadow-sm relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
          {config.icon}
        </div>
        
        <div className="flex items-start gap-6 relative z-10">
          <div className="shrink-0 pt-1">
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-bold ${config.color}`}>{config.label}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.badgeBg} border ${config.badgeBorder} ${config.color}`}>
                  {displayedResult.confidence}% Confidence
                </span>
              </div>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all text-slate-600 dark:text-slate-300"
                title="Copy report"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? t.copied : t.shareReport}
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
              {displayedResult.summary}
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="mt-8">
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>{t.verificationScore}</span>
                <span>{displayedResult.confidence}/100</span>
            </div>
            <div className="w-full h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${displayedResult.confidence > 80 ? 'bg-green-500' : displayedResult.confidence > 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${displayedResult.confidence}%` }}
                />
            </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 transition-colors">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-4">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {t.detailedAnalysis}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-6">
          {displayedResult.detailedAnalysis}
        </p>

        {displayedResult.keyPoints && displayedResult.keyPoints.length > 0 && (
          <div className="space-y-3">
             <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wide">{t.keyFindings}</h4>
             <ul className="grid gap-2">
               {displayedResult.keyPoints.map((point, idx) => (
                 <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm transition-colors">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                   {point}
                 </li>
               ))}
             </ul>
          </div>
        )}
      </div>

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 transition-colors">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {t.verifiedSources}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                    <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                    {source.title || new URL(source.uri || '').hostname}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {source.uri}
                  </p>
                </div>
                <div className="shrink-0 text-indigo-400 dark:text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Chat Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
         {!showChat ? (
             <button
                onClick={() => setShowChat(true)}
                className="w-full py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-center gap-3 text-indigo-700 dark:text-indigo-300 font-semibold hover:shadow-md transition-all group"
             >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t.chatAboutAnalysis}
             </button>
         ) : (
            <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        {t.chatAboutAnalysis}
                     </h3>
                     <button 
                        onClick={() => setShowChat(false)}
                        className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
                     >
                        Close Chat
                     </button>
                </div>
                <ChatWidget t={t} language={currentLanguage} analysisContext={data.result} />
            </div>
         )}
      </div>
    </div>
  );
}