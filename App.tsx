import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MethodologyModal } from './components/MethodologyModal';
import { PromoSection } from './components/PromoSection';
import { NewsSection } from './components/NewsSection';
import { analyzeContent } from './services/gemini';
import { FullAnalysisResponse, Language } from './types';
import { translations } from './translations';
import { Globe, Moon, Sun, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
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

  const scrollToInput = () => {
    const inputElement = document.getElementById('analyzer');
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToNews = () => {
    const newsElement = document.getElementById('news');
    if (newsElement) {
      newsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-500">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:bg-slate-950 dark:from-slate-950 dark:to-slate-950 transition-colors duration-500">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-900 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        {/* Blobs: Increased opacity/visibility in light mode */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-normal dark:bg-indigo-900/20 dark:opacity-30"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:mix-blend-normal dark:bg-blue-900/20 dark:opacity-30"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-purple-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:mix-blend-normal dark:bg-purple-900/20 dark:opacity-30"></div>
      </div>

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)}
        t={t}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {t.appTitle}
            </h1>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={scrollToNews} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                {t.news}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
            </button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                {t.aboutMethodology}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <div className="relative group">
               <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
               <select
                 value={language}
                 onChange={(e) => setLanguage(e.target.value as Language)}
                 className="bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 pl-9 pr-8 py-2 rounded-full border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm max-w-[150px]"
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
              className="hidden sm:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        
        {/* Hero / Intro */}
        {!result && !isLoading && (
          <div className="text-center mb-16 relative">
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 animate-shimmer bg-[length:200%_auto]">
                {t.heroTitle}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              {t.heroSubtitle}
            </p>
          </div>
        )}

        <div className="animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <InputForm 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            t={t}
            />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-xl mx-auto mt-16 text-center animate-fade-in space-y-8">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <div className="w-12 h-12 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-white animate-pulse">
                  {t.analyzing}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.loadingMessage}
                </p>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-center animate-scale-in shadow-sm">
            <p className="font-bold text-lg mb-1">{t.errorTitle}</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <ResultCard data={result} t={t} currentLanguage={language} />}
        
        {/* News Section (Restored) */}
        <NewsSection language={language} t={t} />

        {/* Promotional Section (WhatsApp Bot & Extension) */}
        <PromoSection language={language} t={t} />

      </main>

    </div>
  );
};

export default App;