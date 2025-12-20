import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { TranslationSchema } from '../translations';

interface InputFormProps {
  onAnalyze: (text: string) => void;
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
  const [text, setText] = useState(initialValue);
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // Update text if initialValue changes
  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  }, [text, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      if (text.trim()) {
        onAnalyze(text);
      }
    }
  };

  return (
    <form id="analyzer" onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4 scroll-mt-24">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-30 dark:opacity-40 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden transition-colors">
          
          <textarea
            ref={inputTextAreaRef}
            className="w-full h-40 p-6 text-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none"
            placeholder={t.inputPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="flex items-center justify-end px-6 pb-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 pt-3">
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all transform
                ${isLoading || !text.trim()
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg dark:bg-indigo-600 dark:hover:bg-indigo-500'}
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
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        <span className="text-xs opacity-75">Optimized for Text Verification</span>
      </p>
    </form>
  );
};