import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Type, Link, Image as ImageIcon, Video, Mic, Upload, StopCircle, Trash2, X, Search, Sparkles, FileAudio } from 'lucide-react';
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
          <div className="relative group h-full">
            <textarea
                className="w-full h-64 p-6 text-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed transition-all font-light"
                placeholder={t.inputPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            {text && (
                 <button 
                  onClick={() => setText('')} 
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all opacity-0 group-hover:opacity-100"
                  type="button"
                 >
                    <X className="w-4 h-4" />
                 </button>
            )}
          </div>
        );
      case 'url':
        return (
          <div className="h-64 flex flex-col justify-center items-center p-8">
            <div className={`
              w-full max-w-xl group flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border-2 transition-all duration-300
              ${url ? 'border-indigo-500/40 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
              focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm
            `}>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                 <Link className="w-5 h-5" />
              </div>
              <input
                type="url"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 font-medium text-lg h-full"
                placeholder={t.pasteUrl}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {url && (
                <button 
                  onClick={() => setUrl('')} 
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors mr-1"
                  type="button"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            {url && !url.match(/^https?:\/\/.+\..+/) && (
              <div className="flex items-center gap-2 mt-4 text-rose-500 text-sm font-medium animate-fade-in pl-1 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  {t.invalidUrl}
              </div>
            )}
          </div>
        );
      case 'visual':
        return (
          <div className="h-64 p-8 flex flex-col items-center justify-center">
             {!selectedFile ? (
               <label className="flex flex-col items-center justify-center gap-4 cursor-pointer w-full h-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group relative overflow-hidden">
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg text-indigo-500 group-hover:scale-110 group-hover:text-indigo-600 transition-all z-10">
                   <Upload className="w-8 h-8" />
                 </div>
                 <div className="text-center z-10">
                   <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Upload Image or Video</p>
                   <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Supports JPG, PNG, MP4</p>
                 </div>
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*,video/*"
                   onChange={(e) => handleFileChange(e, 'visual')}
                 />
               </label>
             ) : (
               <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-5 relative border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none animate-scale-in">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                     {selectedFile.type.startsWith('image/') ? (
                       <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                     ) : (
                       <Video className="w-10 h-10 text-indigo-500" />
                     )}
                  </div>
                  <div className="flex-1 min-w-0 py-2">
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{selectedFile.name}</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.split('/')[1]}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 w-fit px-2 py-1 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Ready to analyze
                    </div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="absolute top-2 right-2 p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors text-slate-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>
             )}
             {mediaError && <p className="text-rose-500 font-medium text-sm mt-3 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full">{mediaError}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="h-64 p-8 flex flex-col items-center justify-center">
             {!selectedFile && !recordedBlob ? (
                <div className="grid grid-cols-2 gap-6 w-full h-full">
                   {/* Upload Option */}
                   <label className="flex flex-col items-center justify-center gap-4 cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-md text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-slate-700 dark:text-slate-200">Upload Audio</span>
                        <span className="text-xs text-slate-400">MP3, WAV, M4A</span>
                      </div>
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
                     className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 transition-all group ${
                       isRecording 
                         ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10' 
                         : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10'
                     }`}
                   >
                      <div className={`p-4 rounded-full shadow-md transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' : 'bg-white dark:bg-slate-900 text-rose-500 group-hover:scale-110'}`}>
                        {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </div>
                      <div className="text-center">
                        <span className={`block font-bold ${isRecording ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {isRecording ? "Stop Recording" : "Record Voice"}
                        </span>
                        <span className="text-xs text-slate-400">{isRecording ? "Listening..." : "Use Microphone"}</span>
                      </div>
                   </button>
                </div>
             ) : (
                <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 flex items-center gap-5 relative border border-slate-200 dark:border-slate-700 shadow-xl animate-scale-in">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                       {selectedFile ? <FileAudio className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-lg text-slate-900 dark:text-white">
                         {selectedFile ? selectedFile.name : "Voice Recording"}
                       </p>
                       <div className="flex items-center gap-2 mt-1">
                           <div className="flex gap-1">
                                <span className="w-1 h-3 bg-indigo-400 rounded-full"></span>
                                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                <span className="w-1 h-2 bg-indigo-300 rounded-full"></span>
                                <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                                <span className="w-1 h-3 bg-indigo-400 rounded-full"></span>
                           </div>
                           <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-2">Audio Captured</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedFile(null); setRecordedBlob(null); }} 
                      className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 rounded-full transition-colors text-slate-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                </div>
             )}
             {mediaError && <p className="text-rose-500 font-medium text-sm mt-3">{mediaError}</p>}
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
    <div id="analyzer" className="w-full max-w-4xl mx-auto space-y-8 scroll-mt-32">
      {/* Segmented Control Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-full shadow-inner border border-slate-200 dark:border-slate-700/50 flex gap-1 backdrop-blur-sm overflow-x-auto max-w-full">
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
                relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none select-none whitespace-nowrap z-10
                ${activeTab === tab.id 
                  ? 'text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'}
              `}
            >
              {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-indigo-600 rounded-full -z-10 animate-fade-in transition-all"></div>
              )}
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5]' : ''}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="transform transition-all">
        <div className="relative group">
          
          {/* Main Card with Glassmorphism */}
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-black/40 border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-all duration-300">
            
            {/* Input Area */}
            {renderContent()}

            {/* Footer / Action Area */}
            <div className="flex items-center justify-between px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 flex items-center gap-3">
                {activeTab === 'text' && text.length > 0 && (
                   <span className="flex items-center gap-2 animate-fade-in text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      {text.length} {t.chars}
                   </span>
                )}
                {isRecording && (
                    <span className="flex items-center gap-2 animate-fade-in text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                      Recording Active
                    </span>
                )}
                <span className="hidden sm:inline-block opacity-60">
                   {isLoading ? "Using Gemini 3 Pro..." : "Ready to verify"}
                </span>
              </div>
              
              <button
                type="submit"
                disabled={getButtonDisabled()}
                className={`
                  flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white transition-all duration-300 transform shadow-xl
                  ${getButtonDisabled()
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed translate-y-0 opacity-70 shadow-none' 
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'}
                `}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span className="tracking-wide">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    <span className="tracking-wide">{t.verifyBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Subtle Glow Behind Card */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[36px] opacity-0 transition-opacity duration-500 -z-10 blur-xl ${!getButtonDisabled() && !isLoading ? 'group-hover:opacity-15' : ''}`}></div>
        </div>
      </form>
    </div>
  );
};