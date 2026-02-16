
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { analyzeEA, chatWithExpert } from '../services/gemini';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AIExpert: React.FC<{ code: string }> = ({ code }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial analysis
    const runAnalysis = async () => {
      setIsLoading(true);
      const analysis = await analyzeEA(code);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: analysis || "I've reviewed your MQL5 code. How can I help you improve the strategy or debug the logic?"
      }]);
      setIsLoading(false);
    };
    runAnalysis();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await chatWithExpert(input, code);
    const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response || "I'm sorry, I couldn't process that." };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">FlowShift AI Strategy Expert</h3>
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 3 Pro
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-400 font-medium">
          Context: FlowShift.mq5
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'assistant' ? 'bg-slate-800 text-slate-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
            }`}>
              <div className="prose prose-invert max-w-none">
                {msg.content.split('\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-400 italic">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about risk management, signal filtering, or MQL5 logic..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-200 placeholder-slate-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <AlertCircle className="w-3 h-3" />
          AI can make mistakes. Verify critical code before live execution.
        </div>
      </form>
    </div>
  );
};

export default AIExpert;
