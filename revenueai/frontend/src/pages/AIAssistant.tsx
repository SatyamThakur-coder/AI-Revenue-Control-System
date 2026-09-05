import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { Bot, Send, Sparkles, User, Lightbulb, ChevronRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  structuredResponse?: {
    summary: string;
    keyFactors: string[];
    recommendedActions: string[];
    metrics?: any;
  };
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      structuredResponse: {
        summary: 'Hello! I am your RevenueAI Financial & Growth Assistant. I analyze your organization\'s live database records to provide accurate revenue, profit, refund, and customer churn intelligence.',
        keyFactors: [
          '30-Day Revenue Tracking & Target Achievement',
          'Automated Pricing Anomaly & Discount Leakage Audits',
          'Predictive Customer Retention & At-Risk Account Identification'
        ],
        recommendedActions: [
          'Ask a custom question below or click any quick query pill to begin analysis.'
        ],
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const presetQueries = [
    'Why did revenue decrease this month?',
    'Which product makes the most profit?',
    'How much revenue am I losing from leakage & refunds?',
    'Which customers are likely to churn first?',
    'What should I do to hit next month\'s target?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', { question: textToSend });
      if (res.data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          structuredResponse: res.data.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              RevenueAI Intelligence Assistant
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE DB CONTEXT
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Strictly grounded in your organization's financial transactions</p>
          </div>
        </div>
      </div>

      {/* Preset Query Pills */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 overflow-x-auto flex space-x-2">
        {presetQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-indigo-300 font-medium shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'user' ? (
              <div className="max-w-xl bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none text-xs font-medium shadow-lg shadow-indigo-600/20">
                <p>{msg.text}</p>
                <span className="text-[10px] text-indigo-200 block text-right mt-1 font-mono">{msg.timestamp}</span>
              </div>
            ) : (
              <div className="max-w-2xl bg-slate-900 border border-slate-800 p-5 rounded-2xl rounded-tl-none space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> AI Executive Briefing
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                {/* Structured Answer Render */}
                {msg.structuredResponse && (
                  <div className="space-y-3 text-xs">
                    <p className="text-white font-semibold text-sm leading-relaxed">{msg.structuredResponse.summary}</p>

                    {/* Key Metrics */}
                    {msg.structuredResponse.metrics && (
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                        <div><span className="text-slate-400">Recent 30D Revenue:</span> <span className="font-bold text-white">₹{msg.structuredResponse.metrics.recent30DayRevenue?.toLocaleString()}</span></div>
                        <div><span className="text-slate-400">MoM Growth:</span> <span className="font-bold text-emerald-400">{msg.structuredResponse.metrics.growthPercentage}%</span></div>
                      </div>
                    )}

                    {/* Key Drivers */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Key Factors Identified</h4>
                      {msg.structuredResponse.keyFactors.map((kf, i) => (
                        <div key={i} className="text-slate-300 flex items-start space-x-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{kf}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recommended Actions */}
                    <div className="space-y-1 pt-2 border-t border-slate-800">
                      <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">Recommended Growth Actions</h4>
                      {msg.structuredResponse.recommendedActions.map((ra, i) => (
                        <div key={i} className="text-emerald-300 font-medium flex items-start space-x-2">
                          <ChevronRight className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ra}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs text-indigo-400 flex items-center space-x-2">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Analyzing organization database transactions...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask AI Assistant about revenue, churn, products, leakage..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
