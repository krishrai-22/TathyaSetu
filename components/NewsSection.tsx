import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { fetchTrendingNews } from '../services/gemini';
import { NewsItem, Language } from '../types';
import { TranslationSchema } from '../translations';

interface NewsSectionProps {
  language: Language;
  t: TranslationSchema;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ language, t }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('Trending');

  const categories = [
    { id: 'Trending', label: t.newsCategories.trending },
    { id: 'India', label: t.newsCategories.india },
    { id: 'Technology', label: t.newsCategories.technology },
    { id: 'Science', label: t.newsCategories.science },
    { id: 'Health', label: t.newsCategories.health }
  ];

  const loadNews = async (cat: string = category) => {
    setLoading(true);
    setError(false);
    try {
      const items = await fetchTrendingNews(language, cat);
      setNews(items);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [language, category]);

  return (
    <div id="news" className="w-full max-w-5xl mx-auto mt-12 mb-12 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {t.latestNews}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.newsSubtitle}</p>
        </div>
        
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${category === cat.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
              <div className="flex justify-between mt-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load news</p>
          <button 
            onClick={() => loadNews()}
            className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </button>
        </div>
      ) : news.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {news.map((item, idx) => (
            <article 
              key={idx}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                    {item.source || 'News'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {item.publishedTime || 'Recent'}
                  </span>
                </div>
                
                <div className="block mb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 flex-1">
                  {item.snippet}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No news found for this category.
        </div>
      )}
      
      {!loading && !error && news.length > 0 && (
         <div className="mt-8 text-center">
             <button 
                onClick={() => loadNews()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
             >
                <RefreshCw className="w-4 h-4" />
                {t.loadMoreNews}
             </button>
         </div>
      )}
    </div>
  );
};