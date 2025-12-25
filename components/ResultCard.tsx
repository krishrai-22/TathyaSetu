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
        gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        border: 'border-green-200 dark:border-green-800',
        progress: 'bg-green-500',
        icon: <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.FALSE:
      return {
        color: 'text-red-600 dark:text-red-400',
        gradient: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        border: 'border-red-200 dark:border-red-800',
        progress: 'bg-red-500',
        icon: <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.MISLEADING:
      return {
        color: 'text-orange-600 dark:text-orange-400',
        gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        progress: 'bg-orange-500',
        icon: <AlertTriangle className="w-12 h-12 text-orange-600 dark:text-orange-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.SATIRE:
      return {
        color: 'text-purple-600 dark:text-purple-400',
        gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        progress: 'bg-purple-500',
        icon: <Quote className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
        label: config.label,
        description: config.desc
      };
    default:
      return {
        color: 'text-slate-600 dark:text-slate-400',
        gradient: 'from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900',
        border: 'border-slate-200 dark:border-slate-800',
        progress: 'bg-slate-500',
        icon: <HelpCircle className="w-12 h-12 text-slate-600 dark:text-slate-400" />,
        label: config.label,
        description: config.desc
      };
  }
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
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({sampleRate: 24000});
      audioContextRef.current = ctx;
      
      const stream = streamAudio(textToRead, currentLanguage);
      let nextStartTime = ctx.currentTime + 0.1;
      
      for await (const chunk of stream) {
         if (!isPlayingRef.current) break;

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
    
    audioStackRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    audioStackRef.current = [];
    
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

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 space-y-8 pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
         {/* Audio Button */}
         <button
            onClick={handlePlayAudio}
            disabled={isGeneratingAudio}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all shadow-sm ${
                isPlaying 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
         >
            {isGeneratingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
                <span className="flex items-center gap-2">
                    <Square className="w-3 h-3 fill-current" />
                    <span className="flex gap-0.5 h-3 items-end">
                        <span className="w-0.5 h-2 bg-current animate-pulse"></span>
                        <span className="w-0.5 h-3 bg-current animate-pulse" style={{animationDelay:'0.1s'}}></span>
                        <span className="w-0.5 h-1.5 bg-current animate-pulse" style={{animationDelay:'0.2s'}}></span>
                    </span>
                </span>
            ) : (
                <Volume2 className="w-4 h-4" />
            )}
            {isGeneratingAudio ? t.generatingAudio : isPlaying ? t.stopAudio : t.listenToAnalysis}
         </button>

         {/* Translate Dropdown */}
         <div className="relative group z-20">
            <button
                disabled={isTranslating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                {isTranslating ? t.translating : t.translateTo}
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block">
                {languages.map((lang) => (
                    <button 
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)} 
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {/* Main Verdict Card */}
      <div 
        className={`rounded-3xl border ${config.border} bg-gradient-to-br ${config.gradient} p-8 md:p-10 shadow-lg relative overflow-hidden`} 
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 transform scale-150 pointer-events-none">
          {config.icon}
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
          <div className="shrink-0 pt-1">
             <div className="p-3 bg-white/60 dark:bg-black/20 rounded-2xl shadow-sm border border-white/20">
                {config.icon}
             </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <h2 className={`text-3xl font-bold tracking-tight ${config.color}`}>{config.label}</h2>
              </div>
              
              <button
                onClick={handleCopy}
                className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/50 transition-all text-slate-700 dark:text-slate-200 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? t.copied : t.shareReport}
              </button>
            </div>
            
            <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed font-medium">
              {displayedResult.summary}
            </p>

            {/* Confidence Meter */}
            <div className="mt-8 bg-white/40 dark:bg-black/10 rounded-2xl p-4 border border-white/20">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <span>{t.verificationScore}</span>
                    <span>{displayedResult.confidence}/100</span>
                </div>
                <div className="w-full h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${config.progress} relative`}
                        style={{ width: `${displayedResult.confidence}%` }}
                    >
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staggered Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
          
          {/* Detailed Analysis (Spans 2 cols) */}
          <div 
            className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8"
          >
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800 dark:text-white mb-6">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
              {t.detailedAnalysis}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-8">
              {displayedResult.detailedAnalysis}
            </p>

            {displayedResult.keyPoints && displayedResult.keyPoints.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.keyFindings}</h4>
                <ul className="space-y-3">
                  {displayedResult.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-sm font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sources Column */}
          <div className="space-y-6">
             {/* Verified Sources */}
             <div 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
             >
                 <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800 dark:text-white mb-5">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    {t.verifiedSources}
                 </h3>
                 
                 <div className="space-y-3">
                    {sources && sources.length > 0 ? sources.map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group bg-slate-50 dark:bg-slate-800"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {source.title || new URL(source.uri || '').hostname}
                                </p>
                            </div>
                        </a>
                    )) : (
                        <p className="text-sm text-slate-500 italic">No direct web sources found.</p>
                    )}
                 </div>
             </div>

             {/* Chat Trigger (if not showing) */}
             {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="w-full p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 group"
                >
                    <div className="flex items-center justify-center mb-2">
                        <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="font-bold text-center">{t.chatAboutAnalysis}</div>
                    <div className="text-xs text-indigo-100 text-center mt-1 opacity-80">Ask follow-up questions</div>
                </button>
             )}
          </div>
      </div>

      {/* Contextual Chat Section (Expandable) */}
      {showChat && (
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                 <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    {t.chatAboutAnalysis}
                 </h3>
                 <button 
                    onClick={() => setShowChat(false)}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                 >
                    <XCircle className="w-5 h-5 text-slate-400" />
                 </button>
            </div>
            <div className="p-4">
                <ChatWidget t={t} language={currentLanguage} analysisContext={data.result} />
            </div>
        </div>
      )}
    </div>
  );
}