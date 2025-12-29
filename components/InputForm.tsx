import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Type, Link, Image as ImageIcon, Video, Mic, Upload, StopCircle, Trash2, X, Search, Sparkles } from 'lucide-react';
import { TranslationSchema } from '../translations';
import { AnalyzeInput } from '../services/gemini';

type InputType = 'text' | 'url' | 'visual' | 'audio';

interface InputFormProps {
  onAnalyze: (content: AnalyzeInput) => void;
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
  
  // Media States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  // Reset file/recording when switching tabs
  useEffect(() => {
    setSelectedFile(null);
    setRecordedBlob(null);
    setMediaError(null);
    setIsRecording(false);
  }, [activeTab]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'text' && text.trim()) {
      onAnalyze(text);
    } else if (activeTab === 'url' && url.trim()) {
      onAnalyze({ type: 'url', value: url });
    } else if (activeTab === 'visual' && selectedFile) {
      onAnalyze({ type: 'file', file: selectedFile });
    } else if (activeTab === 'audio') {
      if (selectedFile) {
        onAnalyze({ type: 'file', file: selectedFile });
      } else if (recordedBlob) {
        onAnalyze({ type: 'audio-blob', blob: recordedBlob });
      }
    }
  }, [activeTab, text, url, selectedFile, recordedBlob, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'visual' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size check (e.g., 20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      setMediaError(t.fileTooLarge || "File too large (Max 20MB)");
      return;
    }

    setMediaError(null);
    setSelectedFile(file);
    setRecordedBlob(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMediaError(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMediaError("Microphone access needed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="relative group">
            <textarea
                className="w-full h-56 p-6 text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed transition-all"
                placeholder={t.inputPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            {text && (
                 <button 
                  onClick={() => setText('')} 
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                  type="button"
                 >
                    <X className="w-4 h-4" />
                 </button>
            )}
          </div>
        );
      case 'url':
        return (
          <div className="h-56 flex flex-col justify-center p-8">
            <div className={`
              group flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 transition-all duration-300
              ${url ? 'border-indigo-500/30 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
              focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10
            `}>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                 <Link className="w-5 h-5" />
              </div>
              <input
                type="url"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 font-medium text-lg"
                placeholder={t.pasteUrl}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {url && (
                <button 
                  onClick={() => setUrl('')} 
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            {url && !url.match(/^https?:\/\/.+\..+/) && (
              <div className="flex items-center gap-2 mt-4 text-red-500 text-sm font-medium animate-fade-in pl-1">
                  <AlertCircle className="w-4 h-4" />
                  {t.invalidUrl}
              </div>
            )}
          </div>
        );
      case 'visual':
        return (
          <div className="h-56 p-8 flex flex-col items-center justify-center">
             {!selectedFile ? (
               <label className="flex flex-col items-center gap-4 cursor-pointer p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all w-full h-full justify-center group">
                 <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-500 group-hover:scale-110 transition-transform">
                   <Upload className="w-6 h-6" />
                 </div>
                 <div className="text-center">
                   <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload Image or Video</p>
                   <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, MP4</p>
                 </div>
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*,video/*"
                   onChange={(e) => handleFileChange(e, 'visual')}
                 />
               </label>
             ) : (
               <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 relative border border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                     {selectedFile.type.startsWith('image/') ? (
                       <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                     ) : (
                       <Video className="w-8 h-8 text-slate-400" />
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             )}
             {mediaError && <p className="text-red-500 text-sm mt-2">{mediaError}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="h-56 p-8 flex flex-col items-center justify-center">
             {!selectedFile && !recordedBlob ? (
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                   {/* Upload Option */}
                   <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload File</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, 'audio')}
                      />
                   </label>

                   {/* Record Option */}
                   <button 
                     onClick={isRecording ? stopRecording : startRecording}
                     className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                       isRecording 
                         ? 'border-red-400 bg-red-50 dark:bg-red-900/10' 
                         : 'border-slate-300 dark:border-slate-700 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                     }`}
                   >
                      <div className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                        {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isRecording ? "Stop Recording" : "Record Audio"}
                      </span>
                   </button>
                </div>
             ) : (
                <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 relative border border-slate-200 dark:border-slate-700 justify-center">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                       <Mic className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                       <p className="font-semibold text-slate-900 dark:text-white">
                         {selectedFile ? selectedFile.name : "Recorded Audio"}
                       </p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">Ready to verify</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedFile(null); setRecordedBlob(null); }} 
                      className="absolute top-4 right-4 p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-slate-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                </div>
             )}
             {mediaError && <p className="text-red-500 text-sm mt-2">{mediaError}</p>}
          </div>
        );
      default: return null;
    }
  };

  const getButtonDisabled = () => {
    if (isLoading) return true;
    if (activeTab === 'text') return !text.trim();
    if (activeTab === 'url') return !url.trim() || !url.match(/^https?:\/\/.+\..+/);
    if (activeTab === 'visual') return !selectedFile;
    if (activeTab === 'audio') return !selectedFile && !recordedBlob;
    return true;
  };

  // Helper for invalid URL icon
  const AlertCircle = ({className}: {className: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  );

  return (
    <div id="analyzer" className="w-full max-w-3xl mx-auto space-y-8 scroll-mt-32">
      {/* Segmented Control Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-slate-900/80 p-1.5 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex gap-1 backdrop-blur-sm overflow-x-auto max-w-full">
          {[
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'url', icon: Link, label: 'Link' },
            { id: 'visual', icon: ImageIcon, label: 'Visuals' },
            { id: 'audio', icon: Mic, label: 'Audio' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as InputType); }}
              type="button"
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none select-none whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-100' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transform transition-all">
        <div className="relative group">
          {/* Main Card */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 group-hover:border-indigo-300 dark:group-hover:border-indigo-700/50">
            
            {/* Input Area */}
            {renderContent()}

            {/* Footer / Action Area */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-sm">
              <div className="text-xs font-semibold text-slate-400 pl-2">
                {activeTab === 'text' && text.length > 0 && (
                   <span className="flex items-center gap-2 animate-fade-in">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      {text.length} {t.chars}
                   </span>
                )}
                {isRecording && (
                    <span className="flex items-center gap-2 animate-fade-in text-red-500">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Recording...
                    </span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={getButtonDisabled()}
                className={`
                  flex items-center gap-2.5 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 transform
                  ${getButtonDisabled()
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed translate-y-0 opacity-70' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'}
                `}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 stroke-[3]" />
                    <span>{t.verifyBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Decor element */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[26px] opacity-0 transition-opacity duration-300 -z-10 blur-sm ${!getButtonDisabled() && !isLoading ? 'group-hover:opacity-20' : ''}`}></div>
        </div>
      </form>
    </div>
  );
};