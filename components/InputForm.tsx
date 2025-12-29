import React, { useState, useCallback, useEffect } from 'react';
import { Type, Link, X, Search, Sparkles } from 'lucide-react';
import { TranslationSchema } from '../translations';

type InputType = 'text' | 'url';

interface InputFormProps {
  onAnalyze: (content: string | { type: 'url'; value: string }) => void;
  isLoading: boolean;
  t: TranslationSchema;
  initialValue?: string;
}

export const InputForm: React.FC<InputFormProps> = ({ 
  onAnalyze, 
  isLoading, 
  t,
  initialValue = ''
}) => {
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [text, setText] = useState(initialValue);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'text' && text.trim()) {
      onAnalyze(text);
    } else if (activeTab === 'url' && url.trim()) {
      onAnalyze({ type: 'url', value: url });
    }
  }, [activeTab, text, url, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as any);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="relative">
            <textarea
                className="w-full h-40 p-6 text-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed"
                placeholder={t.inputPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            {text && (
                 <button onClick={() => setText('')} className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-4 h-4" />
                 </button>
            )}
          </div>
        );
      case 'url':
        return (
          <div className="h-40 flex flex-col justify-center p-6">
            <div className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                 <Link className="w-5 h-5 text-indigo-500" />
              </div>
              <input
                type="url"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
                placeholder={t.pasteUrl}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {url && (
                <button onClick={() => setUrl('')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            {url && !url.match(/^https?:\/\/.+\..+/) && (
              <p className="text-red-500 text-xs mt-3 pl-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  {t.invalidUrl}
              </p>
            )}
          </div>
        );
      default: return null;
    }
  };

  const getButtonDisabled = () => {
    if (isLoading) return true;
    if (activeTab === 'text') return !text.trim();
    if (activeTab === 'url') return !url.trim() || !url.match(/^https?:\/\/.+\..+/);
    return true;
  };

  return (
    <div id="analyzer" className="w-full max-w-3xl mx-auto space-y-6 scroll-mt-24">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex gap-1">
          {[
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'url', icon: Link, label: 'Link' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as InputType); }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}
              `}
            >
              <tab.icon className={`w-4 h-4`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
            
            {renderContent()}

            <div className="flex items-center justify-between px-6 pb-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="text-xs text-slate-400 font-medium pl-1">
                {activeTab === 'text' && text.length > 0 && (
                   <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {text.length} {t.chars}
                   </span>
                )}
              </div>
              <button
                type="submit"
                disabled={getButtonDisabled()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all transform
                  ${getButtonDisabled()
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'}
                `}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>{t.verifyBtn}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t.verifyBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};