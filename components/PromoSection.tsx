import React from 'react';
import { TranslationSchema } from '../translations';
import { Language } from '../types';

interface PromoSectionProps {
  language: Language;
  t: TranslationSchema;
}

export const PromoSection: React.FC<PromoSectionProps> = ({ language, t }) => {

  return (
    <section className="py-12 mt-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
      
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
            className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:border-green-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="w-full max-w-xs mx-auto mb-8 relative">
               <img 
                 src="/whatsapp-demo.png" 
                 alt="WhatsApp Bot Preview" 
                 className="w-full h-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 group-hover:scale-[1.02] transition-transform duration-500"
               />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t.promoWhatsappTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-6">{t.promoWhatsappDesc}</p>
          </div>

          {/* Extension Card */}
          <div className="group relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="w-full max-w-xs mx-auto mb-8 relative">
              <img 
                 src="/extension-demo.png" 
                 alt="Web Extension Preview" 
                 className="w-full h-auto rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 group-hover:scale-[1.02] transition-transform duration-500"
               />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.promoExtensionTitle}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base mb-6">{t.promoExtensionDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};