import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, AlertCircle, Clock, ExternalLink } from 'lucide-react';
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
    <div id="news" className="w-full max-w-5xl mx-auto mt-20 mb-12 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Newspaper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            {t.latestNews}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm ml-1">{t.newsSubtitle}</p>
        </div>
        
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                ${category === cat.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
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
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 mb-6"></div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4"></div>
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
            onClick={() => loadNews()}
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
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10"></a>
              <div className="p-7 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                    {item.source || 'News'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {item.publishedTime || 'Recent'}
                  </span>
                </div>
                
                <div className="block mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed flex-1">
                  {item.snippet}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400 italic">
          No news found for this category.
        </div>
      )}
      
      {!loading && !error && news.length > 0 && (
         <div className="mt-10 text-center">
             <button 
                onClick={() => loadNews()}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
             >
                <RefreshCw className="w-4 h-4" />
                {t.loadMoreNews}
             </button>
         </div>
      )}
    </div>
  );
};