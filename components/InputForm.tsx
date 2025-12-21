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

  // Update text if initialValue changes (for popup pasted text)
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
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
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
          <textarea
            className="w-full h-40 p-6 text-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none"
            placeholder={t.inputPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        );
      case 'image':
        return (
          <div 
            className="h-40 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg m-4 hover:border-indigo-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="relative group w-full h-full flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="h-full object-contain rounded" />
                ) : (
                  <div className="text-center">
                    <FileVideo className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{file.name}</span>
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm text-slate-500">{t.uploadTooltip} <span className="text-xs opacity-70">({t.supports})</span></p>
                <p className="text-xs text-slate-400 opacity-80">{t.sizeLimit}</p>
              </div>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="h-40 flex flex-col items-center justify-center space-y-6">
            {file ? (
               <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                 <FileAudio className="w-8 h-8 text-indigo-500" />
                 <div className="text-sm">
                   <p className="font-medium text-slate-700 dark:text-slate-200">{file.name}</p>
                   <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 </div>
                 <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                   <X className="w-4 h-4" />
                 </button>
               </div>
            ) : (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative
                  ${isRecording ? 'bg-red-500 scale-110 shadow-red-500/50 shadow-lg' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg'}
                `}
              >
                {isRecording && <span className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping"></span>}
                {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-8 h-8 text-white" />}
              </button>
            )}
            <p className="text-sm text-slate-500 font-medium">
              {isRecording ? t.recording : file ? t.removeFile : t.recordTooltip}
            </p>
          </div>
        );
      case 'url':
        return (
          <div className="h-40 flex flex-col justify-center p-6">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-indigo-500/50 transition-all">
              <Link className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="url"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                placeholder={t.pasteUrl}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {url && (
                <button onClick={() => setUrl('')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">{t.urlDisclaimer}</p>
            {url && !url.match(/^https?:\/\/.+\..+/) && (
              <p className="text-red-500 text-xs mt-2 pl-2">{t.invalidUrl}</p>
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
    <div id="analyzer" className="w-full max-w-3xl mx-auto space-y-4 scroll-mt-24">
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
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-30 dark:opacity-40 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden transition-colors">
            
            {renderContent()}

            <div className="flex items-center justify-between px-6 pb-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 pt-3">
              <div className="text-xs text-slate-400 font-medium">
                {activeTab === 'text' && `${text.length} ${t.chars}`}
              </div>
              <button
                type="submit"
                disabled={getButtonDisabled()}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all transform
                  ${getButtonDisabled()
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