import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video, CheckCheck, Loader2, X } from 'lucide-react';
import { TranslationSchema } from '../translations';
import { analyzeContent } from '../services/gemini';
import { Language, VerdictType } from '../types';

interface WhatsAppDemoProps {
  t: TranslationSchema;
  language: Language;
  onClose: () => void;
}

interface WAMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export const WhatsAppDemo: React.FC<WhatsAppDemoProps> = ({ t, language, onClose }) => {
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: '1',
      text: t.waWelcome,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read'
    }]);
  }, [t.waWelcome]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: WAMessage = {
      id: messageId,
      text: userText,
      isUser: true,
      timestamp,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Update status to delivered/read after delay
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'read' } : m));
    }, 1000);

    try {
      // Actually call Gemini API
      // Since analyzeContent accepts string | File | url obj, string is fine.
      const result = await analyzeContent(userText, language);
      
      const analysis = result.result;
      
      // Format verdict based on type
      let verdictEmoji = '❓';
      if (analysis.verdict === VerdictType.TRUE) verdictEmoji = '✅';
      if (analysis.verdict === VerdictType.FALSE) verdictEmoji = '❌';
      if (analysis.verdict === VerdictType.MISLEADING) verdictEmoji = '⚠️';
      if (analysis.verdict === VerdictType.SATIRE) verdictEmoji = '🎭';

      // Construct WhatsApp-style formatted message
      // *Bold*, _Italic_, ~Strikethrough~
      const replyText = `*Fact Check Complete* ${verdictEmoji}\n\n` +
        `*Verdict:* ${analysis.verdict}\n` +
        `*Confidence:* ${analysis.confidence}%\n\n` +
        `_${analysis.summary}_\n\n` +
        `*Key Findings:*\n` +
        analysis.keyPoints.map(k => `• ${k}`).join('\n') + `\n\n` +
        `*Sources:*\n` +
        (result.sources.slice(0, 2).map(s => `🔗 ${new URL(s.uri || '').hostname}`).join('\n') || 'No direct links found');

      const botMsg: WAMessage = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
       const errorMsg: WAMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't verify that right now. Please try again later.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      {/* Phone Container */}
      <div className="w-full max-w-sm bg-[#0b141a] h-[600px] max-h-[90vh] rounded-[30px] shadow-2xl overflow-hidden flex flex-col border-[6px] border-[#1f2c34] relative">
        
        {/* Dynamic Island / Notch Simulation */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20"></div>

        {/* WhatsApp Header */}
        <div className="bg-[#1f2c34] px-3 py-3 flex items-center gap-3 shadow-sm z-10 pt-8">
           <button onClick={onClose} className="text-[#aebac1]">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
             M
           </div>
           <div className="flex-1 min-w-0">
             <h3 className="text-[#e9edef] font-medium truncate">TathyaSetu Bot</h3>
             <p className="text-[#8696a0] text-xs truncate">
                {isTyping ? <span className="text-[#00a884] font-medium">{t.waTyping}</span> : t.waOnline}
             </p>
           </div>
           <div className="flex items-center gap-4 text-[#aebac1]">
             <Video className="w-5 h-5" />
             <Phone className="w-5 h-5" />
             <MoreVertical className="w-5 h-5" />
           </div>
        </div>

        {/* Chat Area - WhatsApp Dark Wallpaper */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a] relative">
            {/* Disclaimer */}
            <div className="flex justify-center mb-4">
                <span className="bg-[#1f2c34] text-[#8696a0] text-[10px] px-3 py-1.5 rounded-lg text-center shadow-sm uppercase tracking-wide">
                    {t.waDisclaimer}
                </span>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-1`}
                >
                    <div 
                        className={`
                            max-w-[85%] px-3 py-1.5 rounded-lg text-[14.2px] leading-[19px] relative shadow-sm
                            ${msg.isUser ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#1f2c34] text-[#e9edef] rounded-tl-none'}
                        `}
                    >
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                        <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
                            <span className="text-[11px] text-[#8696a0] min-w-fit">{msg.timestamp}</span>
                            {msg.isUser && (
                                <span className={msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}>
                                    <CheckCheck className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start">
                     <div className="bg-[#1f2c34] px-4 py-3 rounded-lg rounded-tl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-[#1f2c34] p-2 flex items-center gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.waPlaceholder}
                className="flex-1 bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0] rounded-lg px-4 py-2 text-sm focus:outline-none"
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${!input.trim() || isTyping ? 'bg-[#2a3942] text-[#8696a0]' : 'bg-[#00a884] text-white hover:bg-[#008f6f]'}
                `}
            >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
        </form>
      </div>

      {/* Close button outside phone */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};