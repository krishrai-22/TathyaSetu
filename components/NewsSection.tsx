import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { fetchTrendingNews } from '../services/gemini';
import { NewsItem, Language } from '../types';
import { TranslationSchema } from '../translations';

interface NewsSectionProps {
  language: Language;
  t: TranslationSchema;
  onNewsCheck: (headline: string) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ language, t, onNewsCheck }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('Trending');
  const [page, setPage] = useState(1);

  const categories = [
    { id: 'Trending', label: t.newsCategories.trending },
    { id: 'India', label: t.newsCategories.india },
    { id: 'World', label: t.newsCategories.world },
    { id: 'Politics', label: t.newsCategories.politics },
    { id: 'Technology', label: t.newsCategories.technology },
    { id: 'Business', label: t.newsCategories.business },
    { id: 'Science', label: t.newsCategories.science },
    { id: 'Health', label: t.newsCategories.health },
    { id: 'Environment', label: t.newsCategories.environment },
    { id: 'Sports', label: t.newsCategories.sports },
    { id: 'Entertainment', label: t.newsCategories.entertainment },
  ];

  const loadNews = async (cat: string = category, pageNum: number = 1) => {
    setLoading(true);
    setError(false);
    try {
      const items = await fetchTrendingNews(language, cat, 4, pageNum);
      setNews(items);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
    loadNews(category, 1);
  }, [language, category]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNews(category, nextPage);
  };

  return (
    <div id="news" className="w-full max-w-5xl mx-auto mt-24 mb-16 scroll-mt-24">
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                <Newspaper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t.latestNews}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.newsSubtitle}</p>
            </div>
        </div>
        
        {/* Categories - Scrollable container without scrollbar style */}
        <div className="relative group">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide mask-fade">
            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                    px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border
                    ${category === cat.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg transform scale-105' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'}
                `}
                >
                {cat.label}
                </button>
            ))}
            </div>
             {/* Gradient fade indicators for scrolling */}
             <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none md:hidden"></div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 mb-6"></div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4"></div>
              <div className="flex justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium text-lg">Failed to load news</p>
          <button 
            onClick={() => loadNews(category, page)}
            className="mt-6 px-6 py-2.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors inline-flex items-center gap-2 font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : news.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {news.map((item, idx) => (
            <article 
              key={idx}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 flex flex-col h-full relative p-1 hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col h-full rounded-[20px] transition-colors group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                    {item.source || 'News'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    {item.publishedTime || 'Just now'}
                    </span>
                </div>
                
                <div className="block mb-6 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
                    {item.title}
                    </h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <button 
                    onClick={() => onNewsCheck(item.title)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    >
                    <span>Verify this story</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 italic">No news found for this category at the moment.</p>
        </div>
      )}
      
      {!loading && !error && news.length > 0 && (
         <div className="mt-12 text-center">
             <button 
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
             >
                <RefreshCw className="w-4 h-4" />
                {t.loadMoreNews}
             </button>
         </div>
      )}
    </div>
  );
};