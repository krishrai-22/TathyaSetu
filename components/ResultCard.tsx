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
        color: 'text-green-700 dark:text-green-300',
        gradient: 'from-green-50 to-emerald-100/50 dark:from-green-900/30 dark:to-emerald-900/10',
        border: 'border-green-200 dark:border-green-800/50',
        progress: 'bg-green-500',
        icon: <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.FALSE:
      return {
        color: 'text-red-700 dark:text-red-300',
        gradient: 'from-red-50 to-rose-100/50 dark:from-red-900/30 dark:to-rose-900/10',
        border: 'border-red-200 dark:border-red-800/50',
        progress: 'bg-red-500',
        icon: <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.MISLEADING:
      return {
        color: 'text-orange-700 dark:text-orange-300',
        gradient: 'from-orange-50 to-amber-100/50 dark:from-orange-900/30 dark:to-amber-900/10',
        border: 'border-orange-200 dark:border-orange-800/50',
        progress: 'bg-orange-500',
        icon: <AlertTriangle className="w-12 h-12 text-orange-600 dark:text-orange-400" />,
        label: config.label,
        description: config.desc
      };
    case VerdictType.SATIRE:
      return {
        color: 'text-purple-700 dark:text-purple-300',
        gradient: 'from-purple-50 to-violet-100/50 dark:from-purple-900/30 dark:to-violet-900/10',
        border: 'border-purple-200 dark:border-purple-800/50',
        progress: 'bg-purple-500',
        icon: <Quote className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
        label: config.label,
        description: config.desc
      };
    default:
      return {
        color: 'text-slate-700 dark:text-slate-300',
        gradient: 'from-slate-50 to-gray-100/50 dark:from-slate-900/50 dark:to-gray-900/30',
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
    <div className="w-full max-w-4xl mx-auto mt-12 space-y-12 pb-20 animate-slide-up">
      
      {/* Action Bar Floating */}
      <div className="sticky top-24 z-20 flex justify-end">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 dark:border-slate-700/50">
           {/* Audio Button */}
           <button
              onClick={handlePlayAudio}
              disabled={isGeneratingAudio}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all ${
                  isPlaying 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                  {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                  {isTranslating ? t.translating : t.translateTo}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block scrollbar-thin">
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
        </div>
      </div>

      {/* Main Verdict Card */}
      <div 
        className={`rounded-[32px] border ${config.border} bg-gradient-to-br ${config.gradient} p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-all duration-500`} 
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] transform scale-[2] pointer-events-none origin-top-right">
          {config.icon}
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
          <div className="shrink-0 pt-1">
             <div className="p-4 bg-white/80 dark:bg-black/20 rounded-2xl shadow-sm border border-white/40 dark:border-white/5 backdrop-blur-sm">
                {config.icon}
             </div>
          </div>
          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block text-slate-900 dark:text-white">Analysis Verdict</span>
                <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${config.color}`}>{config.label}</h2>
              </div>
              
              <button
                onClick={handleCopy}
                className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/50 transition-all text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? t.copied : t.shareReport}
              </button>
            </div>
            
            <p className="text-slate-800 dark:text-slate-100 text-xl md:text-2xl leading-relaxed font-serif">
              "{displayedResult.summary}"
            </p>

            {/* Confidence Meter */}
            <div className="pt-2">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.verificationScore}</span>
                    <span className={`text-xl font-black ${config.color}`}>{displayedResult.confidence}%</span>
                </div>
                <div className="w-full h-3 bg-white/40 dark:bg-black/20 rounded-full overflow-hidden border border-white/20">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${config.progress} relative shadow-lg`}
                        style={{ width: `${displayedResult.confidence}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staggered Content Grid */}
      <div className="grid md:grid-cols-12 gap-6">
          
          {/* Detailed Analysis (Spans 8 cols) */}
          <div 
            className="md:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col"
          >
            <div className="mb-6 flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t.detailedAnalysis}
                </h3>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg font-light">
                {displayedResult.detailedAnalysis}
                </p>
            </div>

            {displayedResult.keyPoints && displayedResult.keyPoints.length > 0 && (
              <div className="mt-10">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">{t.keyFindings}</h4>
                <div className="grid gap-3">
                  {displayedResult.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 transition-colors">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm shadow-indigo-200 dark:shadow-none">
                        {idx + 1}
                      </span>
                      <span className="text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sources Column (Spans 4 cols) */}
          <div className="md:col-span-4 space-y-6">
             {/* Verified Sources */}
             <div 
                className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 h-fit"
             >
                 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
                    <TrendingUp className="w-4 h-4" />
                    {t.verifiedSources}
                 </h3>
                 
                 <div className="space-y-3">
                    {sources && sources.length > 0 ? sources.map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                        >
                            <div className="mt-1 w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {source.title || new URL(source.uri || '').hostname}
                                </p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                    {new URL(source.uri || '').hostname}
                                </p>
                            </div>
                        </a>
                    )) : (
                        <div className="p-4 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                             <p className="text-sm text-slate-500">No direct web sources found.</p>
                        </div>
                    )}
                 </div>
             </div>

             {/* Chat Trigger (if not showing) */}
             {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    className="w-full p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-3 p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-lg mb-1">{t.chatAboutAnalysis}</div>
                        <div className="text-xs text-indigo-100 opacity-90">Deep dive into this result</div>
                    </div>
                </button>
             )}
          </div>
      </div>

      {/* Contextual Chat Section (Expandable) */}
      {showChat && (
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
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