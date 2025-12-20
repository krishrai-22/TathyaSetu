import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { MethodologyModal } from './components/MethodologyModal';
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 relative transition-colors duration-300">
      
      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)}
        t={t}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t.appTitle}</h1>
          </div>

          {/* Nav - Hidden on mobile, shown on md+ */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={scrollToNews} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t.news}</button>
            <button onClick={() => setShowMethodology(true)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t.aboutMethodology}</button>
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
               <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               <select
                 value={language}
                 onChange={(e) => setLanguage(e.target.value as Language)}
                 className="bg-slate-900 dark:bg-slate-800 text-sm text-white pl-9 pr-8 py-2 rounded-lg border border-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm max-w-[150px]"
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
              className="hidden sm:block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pt-12">
        
        {/* Hero / Intro */}
        {!result && !isLoading && (
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              {t.heroTitle}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>
        )}

        <InputForm 
          onAnalyze={handleAnalyze} 
          isLoading={isLoading} 
          t={t}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-3xl mx-auto mt-12 text-center animate-fade-in space-y-8">
             <div className="inline-flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/40 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">
                  {t.loadingMessage}
                </p>
             </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-3xl mx-auto mt-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-center animate-fade-in">
            <p className="font-medium">{t.errorTitle}</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <ResultCard data={result} t={t} currentLanguage={language} />}

        {/* News Section */}
        <NewsSection language={language} t={t} />

      </main>

    </div>
  );
};

export default App;