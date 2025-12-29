import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MethodologyModal } from './components/MethodologyModal';
import { PromoSection } from './components/PromoSection';
import { NewsSection } from './components/NewsSection';
import { analyzeContent, AnalyzeInput } from './services/gemini';
import { FullAnalysisResponse, Language } from './types';
import { translations } from './translations';
import { Globe, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [prefilledText, setPrefilledText] = useState('');
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = translations[language];

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAnalyze = async (content: AnalyzeInput) => {
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

  const scrollToInput = () => {
    const inputElement = document.getElementById('analyzer');
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNews = () => {
    const newsElement = document.getElementById('news');
    if (newsElement) {
      newsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsCheck = (headline: string) => {
    setPrefilledText(headline);
    scrollToInput();
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 dark:bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 dark:bg-blue-500/10 blur-[120px]" />
      </div>

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)}
        t={t}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 md:gap-3 group cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="relative w-8 h-8 md:w-10 md:h-10">
                <div className="absolute inset-0 bg-indigo-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform opacity-20 dark:opacity-40"></div>
                <img src="/logo.svg" alt="TathyaSetu Logo" className="relative w-full h-full rounded-xl shadow-sm shrink-0" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {t.appTitle}
                </h1>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">AI Verifier</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={scrollToNews} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                {t.news}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                {t.aboutMethodology}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 active:scale-95"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <div className="relative group shrink-0">
               <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
               <select
                 value={language}
                 onChange={(e) => setLanguage(e.target.value as Language)}
                 className="bg-slate-100 dark:bg-slate-800/80 text-sm font-medium text-slate-700 dark:text-slate-200 pl-9 pr-8 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[120px] md:max-w-[160px]"
                 aria-label="Select Language"
               >
                 <option value="en">English</option>
                 <option value="hi">Hindi (हिंदी)</option>
                 <option value="hinglish">Hinglish</option>
                 <option value="bn">Bengali (বাংলা)</option>
                 <option value="te">Telugu (తెలుగు)</option>
                 <option value="mr">Marathi (मराठी)</option>
                 <option value="ta">Tamil (தமிழ்)</option>
                 <option value="gu">Gujarati (ગુજરાતી)</option>
                 <option value="kn">Kannada (ಕನ್ನಡ)</option>
                 <option value="ml">Malayalam (മലയാളം)</option>
                 <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                 <option value="ur">Urdu (اردو)</option>
               </select>
            </div>

            <button 
              onClick={scrollToInput}
              className="hidden sm:flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-32">
        
        {/* Hero / Intro */}
        {!result && !isLoading && (
          <div className="text-center mb-16 md:mb-24 animate-fade-in">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Powered by Gemini 3 Pro
             </div>
            <h2 className="text-4xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
              <span className="block text-slate-900 dark:text-white">Verify Facts.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 animate-gradient bg-300%">
                Defeat Misinformation.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>
        )}

        <div className="transform transition-all duration-500">
            <InputForm 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            t={t}
            initialValue={prefilledText}
            />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-xl mx-auto mt-20 text-center space-y-8 animate-fade-in">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/logo.svg" className="w-10 h-10 opacity-80" alt="loading" />
                </div>
             </div>
             <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t.analyzing}
                </h3>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  {t.loadingMessage}
                </p>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-3xl mx-auto mt-12 p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
            </div>
            <p className="font-bold text-lg mb-2 text-red-700 dark:text-red-400">{t.errorTitle}</p>
            <p className="text-sm text-red-600 dark:text-red-300 opacity-90">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <ResultCard data={result} t={t} currentLanguage={language} />}
        
        {/* News Section */}
        <NewsSection language={language} t={t} onNewsCheck={handleNewsCheck} />

        {/* Promotional Section */}
        <PromoSection language={language} t={t} />

      </main>

    </div>
  );
};

export default App;