import React, { useState, useEffect } from 'react';
import { analyzeContent } from '../services/gemini';
import { FullAnalysisResponse, VerdictType } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Quote, Search, RotateCcw, Loader2, Info, Link } from 'lucide-react';

declare const chrome: any;

export const PopupApp: React.FC = () => {
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const triggerAnalysis = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Check if input is a URL
      const isUrl = /^(https?:\/\/[^\s]+)/.test(trimmed);
      let data;
      
      if (isUrl) {
         // Use the object format for URL analysis as defined in services/gemini
         data = await analyzeContent({ type: 'url', value: trimmed }, 'en');
      } else {
         data = await analyzeContent(trimmed, 'en');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Notify background that popup is open to clear badge and check for pending text
  useEffect(() => {
    try {
      if (typeof chrome !== 'undefined' && chrome?.runtime) {
        chrome.runtime.connect({ name: "popup-open" });
        
        // Check for selected text from context menu
        chrome.storage.local.get(['pending_verification'], (data: any) => {
          if (data.pending_verification) {
            const pendingText = data.pending_verification;
            setInputText(pendingText);
            
            // Auto-trigger analysis immediately
            triggerAnalysis(pendingText);
            
            // Clear storage so it doesn't persist forever
            chrome.storage.local.remove('pending_verification');
          }
        });
      }
    } catch (e) {
      console.log("Not running in actual extension environment");
    }
  }, []);

  const handleManualVerify = () => {
    triggerAnalysis(inputText);
  };

  const getVerdictUI = (verdict: VerdictType) => {
    switch (verdict) {
      case VerdictType.TRUE:
        return {
          label: "True / Accurate",
          icon: <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />,
          color: "text-green-600 bg-green-50 border-green-200"
        };
      case VerdictType.FALSE:
        return {
          label: "False / Misinformation",
          icon: <XCircle className="w-16 h-16 text-red-500 mb-2" />,
          color: "text-red-600 bg-red-50 border-red-200"
        };
      case VerdictType.MISLEADING:
        return {
          label: "Misleading",
          icon: <AlertTriangle className="w-16 h-16 text-orange-500 mb-2" />,
          color: "text-orange-600 bg-orange-50 border-orange-200"
        };
      case VerdictType.SATIRE:
        return {
          label: "Satire",
          icon: <Quote className="w-16 h-16 text-purple-500 mb-2" />,
          color: "text-purple-600 bg-purple-50 border-purple-200"
        };
      default:
        return {
          label: "Unverified",
          icon: <HelpCircle className="w-16 h-16 text-slate-500 mb-2" />,
          color: "text-slate-600 bg-slate-50 border-slate-200"
        };
    }
  };

  const isUrlInput = /^(https?:\/\/[^\s]+)/.test(inputText.trim());

  return (
    <div className="w-[350px] min-h-[400px] bg-white text-slate-900 font-sans flex flex-col relative overflow-hidden">
      
      {/* Simple Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="TS" className="w-6 h-6 rounded-full" />
            <h1 className="font-bold text-lg tracking-tight text-indigo-600">TathyaSetu</h1>
        </div>
        {result && (
           <button 
             onClick={() => setResult(null)} 
             className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
             title="Check another"
           >
             <RotateCcw className="w-5 h-5" />
           </button>
        )}
      </div>

      <main className="flex-1 p-5 flex flex-col">
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fade-in">
             <div className="relative">
                 <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                 <img src="/logo.svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
             </div>
             <p className="text-sm font-medium text-slate-500 animate-pulse">
               {isUrlInput ? "Verifying link credibility..." : "Verifying facts..."}
             </p>
          </div>
        ) : result ? (
          // Result View
          <div className="flex-1 flex flex-col items-center text-center animate-slide-up">
            
            <div className="mt-4 mb-6">
                {getVerdictUI(result.result.verdict).icon}
                <h2 className={`text-2xl font-bold ${getVerdictUI(result.result.verdict).color.split(' ')[0]}`}>
                  {getVerdictUI(result.result.verdict).label}
                </h2>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                   Confidence: {result.result.confidence}%
                </div>
            </div>

            <div className={`p-4 rounded-xl border ${getVerdictUI(result.result.verdict).color} mb-4 w-full`}>
               <p className="text-sm font-medium leading-relaxed">
                 {result.result.summary}
               </p>
            </div>
            
            <div className="text-xs text-slate-400 mt-auto">
               Verified against {result.sources.length} sources via Google.
            </div>

          </div>
        ) : (
          // Input View
          <div className="flex-1 flex flex-col animate-fade-in">
            
            {inputText && !isUrlInput ? (
                <div className="mb-3 flex gap-2 p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Text captured from page.</span>
                </div>
            ) : null}

            {isUrlInput && (
                 <div className="mb-3 flex gap-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                    <Link className="w-4 h-4 shrink-0" />
                    <span>URL detected. Will verify link credibility.</span>
                </div>
            )}

            {!inputText && (
                <p className="text-sm text-slate-500 mb-3">
                   Paste text or URL below to verify.
                </p>
            )}

            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-4 text-slate-700 placeholder:text-slate-400"
              placeholder="Paste text or https:// link here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {error && (
              <div className="mb-4 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleManualVerify}
              disabled={!inputText.trim()}
              className={`
                w-full py-3 rounded-xl font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition-all
                ${!inputText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
              `}
            >
              <Search className="w-4 h-4" />
              Verify
            </button>
          </div>
        )}
      </main>
    </div>
  );
};