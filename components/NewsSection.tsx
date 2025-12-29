import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Clock, ArrowUpRight, ChevronRight } from 'lucide-react';
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
      <div className="flex flex-col gap-6 mb-10">
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
        
        {/* Categories - Scrollable container */}
        <div className="relative group">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide mask-fade">
            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                    px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border
                    ${category === cat.id 
                    ? 'bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-500/20' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400'}
                `}
                >
                {cat.label}
                </button>
            ))}
            </div>
             <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none md:hidden"></div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden animate-pulse">
              <div className="flex justify-between mb-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
              </div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4"></div>
              <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">Could not fetch news</p>
          <p className="text-slate-500 text-sm mb-6">Please check your connection and try again.</p>
          <button 
            onClick={() => loadNews(category, page)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors inline-flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
        </div>
      ) : news.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {news.map((item, idx) => (
            <article 
              key={idx}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 flex flex-col h-full relative p-1 hover:border-indigo-200 dark:hover:border-indigo-900"
            >
              <div className="p-6 flex flex-col h-full rounded-[20px] bg-white dark:bg-slate-900 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                    {item.source || 'News'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {item.publishedTime || 'Recent'}
                    </span>
                </div>
                
                <div className="block mb-6 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
                    {item.title}
                    </h3>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <button 
                    onClick={() => onNewsCheck(item.title)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                    <span>Verify this</span>
                    <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </a>
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
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
             >
                <RefreshCw className="w-4 h-4" />
                {t.loadMoreNews}
             </button>
         </div>
      )}
    </div>
  );
};