import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Type, Image as ImageIcon, Mic, Link, Upload, X, Play, Square, Search, Sparkles, FileAudio, FileVideo } from 'lucide-react';
import { TranslationSchema } from '../translations';

type InputType = 'text' | 'image' | 'audio' | 'url';

interface InputFormProps {
  onAnalyze: (content: string | File | { type: 'url'; value: string }) => void;
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
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'video/mp4'];
    if (validTypes.includes(file.type)) {
      if (file.size > 100 * 1024 * 1024) { 
        alert(t.fileTooLarge);
        return;
      }
      setFile(file);
      if (file.type.startsWith('image/')) setActiveTab('image');
      else setActiveTab('audio');
    } else {
      alert("Unsupported file type");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
        setFile(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'text' && text.trim()) {
      onAnalyze(text);
    } else if ((activeTab === 'image' || activeTab === 'audio') && file) {
      onAnalyze(file);
    } else if (activeTab === 'url' && url.trim()) {
      onAnalyze({ type: 'url', value: url });
    }
  }, [activeTab, text, file, url, onAnalyze]);

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
      case 'image':
        return (
          <div 
            className={`h-40 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl m-4 transition-all duration-300 cursor-pointer ${
                dragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="relative group w-full h-full flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="h-full object-contain rounded shadow-sm" />
                ) : (
                  <div className="text-center">
                    <FileVideo className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{file.name}</span>
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2">
                     <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t.uploadTooltip}</p>
                    <p className="text-xs text-slate-400 mt-1">{t.supports} • {t.sizeLimit}</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="h-40 flex flex-col items-center justify-center space-y-6">
            {file ? (
               <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <div className="text-sm">
                   <p className="font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                   <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 </div>
                 <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
            ) : (
              <>
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`
                    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative
                    ${isRecording ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/40' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}
                    `}
                >
                    {isRecording && <span className="absolute inset-0 rounded-full border-[3px] border-white/30 animate-ping"></span>}
                    {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
                </button>
                <p className="text-sm text-slate-500 font-medium animate-pulse">
                {isRecording ? t.recording : t.recordTooltip}
                </p>
              </>
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
    }
  };

  const getButtonDisabled = () => {
    if (isLoading) return true;
    if (activeTab === 'text') return !text.trim();
    if (activeTab === 'image' || activeTab === 'audio') return !file;
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
            { id: 'image', icon: ImageIcon, label: 'Media' },
            { id: 'audio', icon: Mic, label: 'Audio' },
            { id: 'url', icon: Link, label: 'Link' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as InputType); setFile(null); }}
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
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} 
        className="hidden" 
        accept="image/*,audio/*,video/*"
      />
    </div>
  );
};