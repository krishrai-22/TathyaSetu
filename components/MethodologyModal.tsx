import React from 'react';
import { X, ShieldCheck, Search, Scale, Globe, BookOpen, Building2, Zap, ArrowRight, Activity, ArrowDown } from 'lucide-react';
import { TranslationSchema } from '../translations';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationSchema;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const tm = t.modal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up transition-colors">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{tm.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-10">
          
          {/* Section 0: Unique Value Proposition (New) */}
          <section className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-current" />
              {tm.uniqueTitle}
            </h3>
            <p className="text-indigo-800/80 dark:text-indigo-200/70 text-sm mb-6 leading-relaxed">
              {tm.uniqueDesc}
            </p>

            {/* Feature List */}
            <div className="grid gap-4 sm:grid-cols-3 mb-8">
               {tm.uniqueFeatures.map((feature, idx) => (
                 <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">{feature.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{feature.desc}</p>
                 </div>
               ))}
            </div>

            {/* Flowchart Visualization */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wider mb-4 text-center">{tm.flowLabel}</h4>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2 w-full sm:w-1/3">
                  <div className="w-full bg-white dark:bg-slate-800 p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-center shadow-sm">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{tm.flowStep1}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-indigo-400">
                  <ArrowRight className="w-5 h-5 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 sm:hidden" />
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2 w-full sm:w-1/3 relative">
                  <div className="absolute -top-3 right-0">
                     <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                     </span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-800 p-3 rounded-lg border-2 border-indigo-500 dark:border-indigo-500 text-center shadow-md">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{tm.flowStep2}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Google Search + AI Reasoning</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-indigo-400">
                  <ArrowRight className="w-5 h-5 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 sm:hidden" />
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2 w-full sm:w-1/3">
                  <div className="w-full bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-2 border-green-500 dark:border-green-500 text-center shadow-sm">
                    <p className="font-bold text-green-700 dark:text-green-400 text-sm">{tm.flowStep3}</p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Section 1: The Process */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              {tm.processTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-sm">
              {tm.processDesc}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300 text-sm">
              {tm.steps.map((step, idx) => (
                <li key={idx}><strong>{step}</strong></li>
              ))}
            </ul>
          </section>

          {/* Section 2: Credible Sources */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              {tm.sourcesTitle}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-sm">
              {tm.sourcesDesc}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{tm.majorNews}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tm.majorNewsDesc}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{tm.academic}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tm.academicDesc}</p>
              </div>
            </div>
          </section>

          {/* Section 3: Evaluation Criteria */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              {tm.metricsTitle}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">{tm.consensus}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{tm.consensusDesc}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">{tm.context}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{tm.contextDesc}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[100px]">{tm.bias}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{tm.biasDesc}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <button 
            onClick={onClose}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {tm.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};