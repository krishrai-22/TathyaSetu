import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MethodologyModal } from './components/MethodologyModal';
import { PromoSection } from './components/PromoSection';
import { NewsSection } from './components/NewsSection';
import { analyzeContent, AnalyzeInput } from './services/gemini';
import { FullAnalysisResponse, Language } from './types';
import { translations } from './translations';
import { Globe, Moon, Sun, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-slate-50/80 to-slate-50 dark:from-slate-950/0 dark:via-slate-950/80 dark:to-slate-950"></div>
      </div>

      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse-slow" />
          <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)}
        t={t}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="relative w-9 h-9 md:w-11 md:h-11 shadow-lg shadow-indigo-500/20 rounded-xl overflow-hidden ring-1 ring-white/20 dark:ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <img src="/logo.svg" alt="TathyaSetu" className="relative w-full h-full p-0.5" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none font-display">
                {t.appTitle}
                </h1>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase mt-0.5">Truth Bridge</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={scrollToNews} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                {t.news}
            </button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                {t.aboutMethodology}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <div className="relative group shrink-0">
               <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none z-10" />
               <select
                 value={language}
                 onChange={(e) => setLanguage(e.target.value as Language)}
                 className="bg-slate-100/80 dark:bg-slate-800/60 text-sm font-medium text-slate-700 dark:text-slate-200 pl-9 pr-8 py-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none cursor-pointer transition-all max-w-[120px] md:max-w-[140px]"
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-32">
        
        {/* Hero / Intro */}
        {!result && !isLoading && (
          <div className="text-center mb-16 md:mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] drop-shadow-sm">
              <span className="block text-slate-900 dark:text-white">Verify Facts.</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400 animate-gradient bg-300%">
                Defeat Misinformation.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              {t.heroSubtitle}
            </p>
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm mt-10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                 <div className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Powered by Gemini 3 Pro</span>
            </div>
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
             <div className="relative w-28 h-28 mx-auto">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100 dark:border-slate-800/50"></div>
                {/* Spinning Ring */}
                <div className="absolute inset-0 rounded-full border-[6px] border-indigo-600/20 border-t-indigo-600 dark:border-indigo-400/20 dark:border-t-indigo-400 animate-spin"></div>
                {/* Pulse Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center relative">
                         <img src="/logo.svg" className="w-8 h-8 opacity-90 animate-pulse" alt="loading" />
                    </div>
                </div>
             </div>
             <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                  {t.analyzing}
                  <span className="flex gap-1">
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {t.loadingMessage}
                </p>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-3xl mx-auto mt-12 p-1 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-2xl">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl text-center backdrop-blur-sm">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <Sparkles className="w-6 h-6 rotate-180" />
                </div>
                <p className="font-bold text-xl mb-2 text-slate-900 dark:text-white">{t.errorTitle}</p>
                <p className="text-slate-600 dark:text-slate-300">{error}</p>
              </div>
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