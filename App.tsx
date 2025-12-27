import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MethodologyModal } from './components/MethodologyModal';
import { PromoSection } from './components/PromoSection';
import { NewsSection } from './components/NewsSection';
import { analyzeContent } from './services/gemini';
import { FullAnalysisResponse, Language } from './types';
import { translations } from './translations';
import { Globe, Moon, Sun } from 'lucide-react';

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
      
      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)}
        t={t}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <img src="/logo.svg" alt="TathyaSetu Logo" className="w-8 h-8 rounded-full shadow-sm" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.appTitle}
            </h1>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={scrollToNews} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t.news}
            </button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {t.aboutMethodology}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                 className="bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 pl-9 pr-8 py-2 rounded-full border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors max-w-[150px]"
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
              className="hidden sm:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
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
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
                 <img src="/logo.svg" alt="Logo" className="w-20 h-20 shadow-2xl rounded-full animate-bounce-slow" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {t.heroTitle}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>
        )}

        <div>
            <InputForm 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            t={t}
            />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-xl mx-auto mt-16 text-center space-y-8">
             <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/logo.svg" className="w-12 h-12 opacity-50" alt="loading" />
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
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
          <div className="w-full max-w-3xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-center">
            <p className="font-bold text-lg mb-1">{t.errorTitle}</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <ResultCard data={result} t={t} currentLanguage={language} />}
        
        {/* News Section */}
        <NewsSection language={language} t={t} />

        {/* Promotional Section */}
        <PromoSection language={language} t={t} />

      </main>

    </div>
  );
};

export default App;