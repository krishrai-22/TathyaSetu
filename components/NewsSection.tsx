import React, { useEffect, useState } from 'react';
import { fetchTrendingNews } from '../services/gemini';
import { NewsItem, Language } from '../types';
import { TranslationSchema } from '../translations';
import { Newspaper, ExternalLink, Clock, RefreshCw, MessageCircle, Laptop, Play, DownloadCloud } from 'lucide-react';
import { WhatsAppDemo } from './WhatsAppDemo';

interface NewsSectionProps {
  language: Language;
  t: TranslationSchema;
}

const CATEGORIES = [
  'trending',
  'india',
  'world',
  'technology',
  'business',
  'science',
  'health',
  'sports'
] as const;

export const NewsSection: React.FC<NewsSectionProps> = ({ language, t }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState<string>('Trending');
  const [count, setCount] = useState(4);
  const [showWaDemo, setShowWaDemo] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const categories = CATEGORIES.map(key => ({
    key,
    label: t.newsCategories[key as keyof typeof t.newsCategories]
  }));

  const loadNews = async () => {
    setLoading(true);
    try {
      const items = await fetchTrendingNews(language, category, count);
      setNews(items);
      setHasLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only auto-fetch if user has already initiated loading once (for category switching)
  useEffect(() => {
    let mounted = true;
    if (hasLoaded) {
       const fetch = async () => {
          setLoading(true);
          try {
            const items = await fetchTrendingNews(language, category, 4);
            if(mounted) setNews(items);
          } catch(e) { console.error(e) } finally { if(mounted) setLoading(false) }
       }
       fetch();
    }
    return () => { mounted = false; };
  }, [category, language]);

  const handleCategoryChange = (newCategory: string) => {
    if (newCategory === category) return;
    setCategory(newCategory);
    setCount(4); 
    setNews([]); 
    // If not loaded yet, do nothing (wait for button click). If loaded, useEffect handles it.
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newCount = count + 4;
    setCount(newCount);
    try {
      const items = await fetchTrendingNews(language, category, newCount);
      setNews(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const getSafeUrl = (url: string) => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <section id="news" className="py-12 border-t border-slate-200 dark:border-slate-800 mt-12 scroll-mt-20 transition-colors">
      
      {showWaDemo && (
        <WhatsAppDemo t={t} language={language} onClose={() => setShowWaDemo(false)} />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
          <Newspaper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.latestNews}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.newsSubtitle}</p>
        </div>
      </div>

      {!hasLoaded ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
           <p className="text-slate-600 dark:text-slate-400 mb-4">View real-time news about misinformation trends.</p>
           <button 
             onClick={loadNews}
             disabled={loading}
             className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md"
           >
             {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
             Load Latest News
           </button>
        </div>
      ) : (
        <>
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => {
                const isSelected = (cat.key === 'trending' && category === 'Trending') || 
                                    (cat.key === category.toLowerCase());
                
                return (
                    <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key === 'trending' ? 'Trending' : cat.key.charAt(0).toUpperCase() + cat.key.slice(1))}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isSelected 
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md transform scale-105' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    `}
                    >
                    {cat.label}
                    </button>
                );
                })}
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 h-32">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                ))}
                </div>
            ) : (
                <>
                <div className="grid md:grid-cols-2 gap-6">
                    {news.map((item, idx) => (
                    <a 
                        key={idx}
                        href={getSafeUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 flex flex-col h-full"
                    >
                        <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wide truncate max-w-[120px]">
                            {item.source}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {item.publishedTime}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                            {item.snippet}
                        </p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {t.readMore}
                        <ExternalLink className="w-4 h-4" />
                        </div>
                    </a>
                    ))}
                    {news.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 dark:text-slate-400 py-8">
                        No recent news found for this category.
                    </div>
                    )}
                </div>

                {news.length > 0 && (
                    <div className="mt-8 text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loadingMore ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                        <RefreshCw className="w-4 h-4" />
                        )}
                        {t.loadMoreNews}
                    </button>
                    </div>
                )}
                </>
            )}
        </>
      )}

      {/* Promotional Section */}
      <div className="mt-20 bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{t.promoTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light">{t.promoSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
          <div 
            onClick={() => setShowWaDemo(true)}
            className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:border-green-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="w-full max-w-xs mx-auto aspect-[3/4] sm:aspect-video bg-white dark:bg-slate-900 rounded-2xl mb-8 flex items-center justify-center border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              <div className="relative z-10 w-24 h-40 border-2 border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 shadow-xl">
                 <MessageCircle className="w-10 h-10 text-green-500" />
                 <div className="absolute -right-2 top-8 w-1 h-6 bg-slate-300 dark:bg-slate-700 rounded-r-md"></div>
                 <div className="absolute -left-2 top-8 w-1 h-3 bg-slate-300 dark:bg-slate-700 rounded-l-md"></div>
              </div>
              <div className="absolute bottom-4 text-xs font-mono text-green-500/50">WhatsApp Bot</div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t.promoWhatsappTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-6">{t.promoWhatsappDesc}</p>
            
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors flex items-center gap-2 text-sm shadow-sm">
                <Play className="w-4 h-4 fill-current" />
                {t.waDemoBtn}
            </button>
            <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide opacity-80">{t.waComingSoon}</p>
          </div>

          <div className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="w-full max-w-xs mx-auto aspect-[3/4] sm:aspect-video bg-white dark:bg-slate-900 rounded-2xl mb-8 flex items-center justify-center border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <div className="relative z-10 w-48 h-32 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600 flex items-center px-2 gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center relative">
                      <Laptop className="w-10 h-10 text-blue-500" />
                  </div>
              </div>
              <div className="absolute bottom-4 text-xs font-mono text-blue-500/50">Browser Extension</div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.promoExtensionTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-6">{t.promoExtensionDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}