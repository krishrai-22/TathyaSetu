import React, { useState } from 'react';
import { MessageCircle, Laptop, Play } from 'lucide-react';
import { TranslationSchema } from '../translations';
import { Language } from '../types';
import { WhatsAppDemo } from './WhatsAppDemo';

interface PromoSectionProps {
  language: Language;
  t: TranslationSchema;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ language, t }) => {
  const [showWaDemo, setShowWaDemo] = useState(false);

  return (
    <section className="py-12 mt-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
      
      {showWaDemo && (
        <WhatsAppDemo t={t} language={language} onClose={() => setShowWaDemo(false)} />
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{t.promoTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light">{t.promoSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
          {/* WhatsApp Card */}
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

          {/* Extension Card */}
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
};