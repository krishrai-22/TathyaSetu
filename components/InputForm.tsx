import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, Paperclip, X, Link, Mic, Square, Volume2, Globe } from 'lucide-react';
import { TranslationSchema } from '../translations';

interface InputFormProps {
  onAnalyze: (text: string, file: File | null, url: string | null) => void;
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
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Update text if initialValue changes (e.g. from context menu in extension)
  useEffect(() => {
    if (initialValue) setText(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || file || url) {
      onAnalyze(text, file, url);
    }
  }, [text, file, url, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      if (text.trim() || file || url) {
        onAnalyze(text, file, url);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    // Basic size check (100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert(t.fileTooLarge);
      return;
    }

    setFile(selectedFile);
    
    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tempUrl.trim()) {
      try {
        new URL(tempUrl); // Validate URL
        setUrl(tempUrl);
        setTempUrl('');
        setShowUrlInput(false);
      } catch (e) {
        alert(t.invalidUrl);
      }
    }
  };

  const clearUrl = () => {
    setUrl(null);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
        processFile(audioFile);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <form id="analyzer" onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4 scroll-mt-24">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-30 dark:opacity-40 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden transition-colors">
          
          <textarea
            ref={inputTextAreaRef}
            className="w-full h-32 p-6 text-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none focus:ring-0 resize-none outline-none"
            placeholder={isRecording ? t.recording : t.inputPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRecording}
          />

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center z-10 animate-fade-in">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Mic className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{t.recording}</p>
              <button
                type="button"
                onClick={stopRecording}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Square className="w-4 h-4 fill-current" />
                {t.stopRecording}
              </button>
            </div>
          )}

          {/* Attachments Preview Area */}
          {(file || url || showUrlInput) && (
            <div className="px-6 pb-2 space-y-2">
              {/* URL Input */}
              {showUrlInput && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 focus-within:border-indigo-400 transition-all">
                    <Globe className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder={t.pasteUrl}
                      className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 w-full placeholder-slate-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUrlSubmit();
                        } else if (e.key === 'Escape') {
                           setShowUrlInput(false);
                        }
                      }}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleUrlSubmit()}
                    className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                  >
                    Add
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* URL Preview */}
              {url && (
                 <div className="relative inline-flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg pr-8 pl-3 py-2 max-w-full">
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-md shadow-sm">
                       <Link className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm text-indigo-900 dark:text-indigo-200 truncate font-medium">{url}</span>
                    <button
                      type="button"
                      onClick={clearUrl}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-full"
                      title={t.removeUrl}
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
              )}

              {/* File Preview */}
              {file && (
                <div className="relative inline-block">
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-32 flex items-center">
                    {file.type.startsWith('video/') ? (
                      <video src={previewUrl!} className="max-h-32 max-w-xs object-cover" controls={false} />
                    ) : file.type.startsWith('audio/') ? (
                      <div className="px-4 py-3 flex items-center gap-3 min-w-[250px]">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center shrink-0">
                          <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{file.name}</p>
                          <audio src={previewUrl!} controls className="h-6 w-full mt-1" />
                        </div>
                      </div>
                    ) : (
                      <img src={previewUrl!} alt="Preview" className="max-h-32 max-w-xs object-cover" />
                    )}
                    
                    {/* File Info for Non-Audio */}
                    {!file.type.startsWith('audio/') && (
                      <div className="px-3 py-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    title={t.removeFile}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-6 pb-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 pt-3 flex-wrap gap-y-2">
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,audio/mp3,audio/wav,audio/mpeg,audio/webm"
                className="hidden"
              />
              
              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isRecording}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
                title={t.uploadTooltip}
              >
                <Paperclip className="w-4 h-4" />
                <span className="hidden sm:inline">{t.uploadTooltip.split('(')[0]}</span>
              </button>

              {/* Link Button */}
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(true);
                  setTimeout(() => urlInputRef.current?.focus(), 100);
                }}
                disabled={isLoading || isRecording || !!url}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    url ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title={t.urlTooltip}
              >
                <Link className="w-4 h-4" />
                <span className="hidden sm:inline">{t.urlTooltip}</span>
              </button>

              {/* Record Button */}
              <button
                type="button"
                onClick={startRecording}
                disabled={isLoading || isRecording || !!file}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  file ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
                title={t.recordTooltip}
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">{t.recordTooltip}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isRecording || (!text.trim() && !file && !url)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all transform
                ${isLoading || isRecording || (!text.trim() && !file && !url)
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
        <span className="text-xs opacity-75">{t.supports}</span>
      </p>
    </form>
  );
};