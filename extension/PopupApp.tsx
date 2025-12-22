import React, { useState, useEffect } from 'react';
import { InputForm } from '../components/InputForm';
import { ResultCard } from '../components/ResultCard';
import { analyzeContent } from '../services/gemini';
import { FullAnalysisResponse, Language } from '../types';
import { translations } from '../translations';
import { Globe, Moon, Sun, ArrowLeft, Info } from 'lucide-react';

declare const chrome: any;

export const PopupApp: React.FC = () => {
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [initialText, setInitialText] = useState('');

  const t = translations[language];

  // Notify background that popup is open to clear badge
  useEffect(() => {
    try {
      if (typeof chrome !== 'undefined' && chrome?.runtime) {
        chrome.runtime.connect({ name: "popup-open" });
        
        // Check for selected text from context menu
        chrome.storage.local.get(['pending_verification'], (data: any) => {
          if (data.pending_verification) {
            setInitialText(data.pending_verification);
            
            // Clear storage so it doesn't persist forever
            chrome.storage.local.remove('pending_verification');
          }
        });
      }
    } catch (e) {
      console.log("Not running in actual extension environment");
    }
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAnalyze = async (content: string | File | { type: 'url'; value: string }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await analyzeContent(content, language);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8 transition-colors w-[400px]">
      
      {/* Compact Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
            {result ? (
               <button onClick={handleReset} className="p-1 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                 <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
               </button>
            ) : null}
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t.appTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
           <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 py-1.5 pl-2 pr-1 rounded-md border-none focus:ring-0 cursor-pointer max-w-[80px]"
            >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="hinglish">HIN</option>
                <option value="bn">BN</option>
                <option value="te">TE</option>
                <option value="mr">MR</option>
                <option value="ta">TA</option>
                <option value="gu">GU</option>
                <option value="kn">KN</option>
                <option value="ml">ML</option>
                <option value="pa">PA</option>
                <option value="ur">UR</option>
            </select>
        </div>
      </header>

      <main className="p-4">
        {!result ? (
          <div className="animate-fade-in">
            {initialText && (
               <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex gap-2 items-start">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">
                    <span className="font-semibold">Ready to verify!</span><br/>
                    Text pasted from your selection. Press "Verify" below.
                  </div>
               </div>
            )}
            
            {!initialText && (
               <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <strong>Tip:</strong> You can select text on any website, Right Click, and choose "Verify with TathyaSetu".
                  </p>
                  <div className="text-[10px] text-slate-400">
                    (You must click this icon to see results)
                  </div>
               </div>
            )}

            <div className="popup-input-wrapper">
                 <InputForm 
                    onAnalyze={handleAnalyze} 
                    isLoading={isLoading} 
                    t={t}
                    initialValue={initialText}
                />
            </div>
            
            {isLoading && (
               <div className="mt-8 text-center text-sm text-slate-500 animate-pulse">
                  {t.loadingMessage}
               </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-slide-up">
            <ResultCard data={result} t={t} currentLanguage={language} />
          </div>
        )}
      </main>

      <style>{`
        /* CSS Overrides to make InputForm fit in popup */
        #analyzer textarea {
           height: 100px;
           font-size: 13px;
        }
        #analyzer button {
           padding-top: 6px;
           padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};