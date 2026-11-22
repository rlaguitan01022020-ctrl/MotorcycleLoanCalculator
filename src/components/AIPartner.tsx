import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  Radio,
  RotateCcw,
  Languages,
  Headphones,
  Check,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { ChatMessage, LoanCalculationResult } from '../types';
import { formatPHP } from '../utils/calculator';

interface AIPartnerProps {
  currentModel: string;
  currentSeries: string;
  calculation: LoanCalculationResult;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const AIPartner: React.FC<AIPartnerProps> = ({
  currentModel,
  currentSeries,
  calculation,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your Motorcycle Financing & Sales AI Partner. I can guide you through CFMOTO motorcycle models, compute real-time loan installments, explain documentary requirements, or practice conversational dealership Tagalog and English with you. What would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'loan_consultant' | 'language_practice'>('loan_consultant');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Zephyr' | 'Fenrir'>('Kore');
  const [audioSupported, setAudioSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external query trigger
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = mode === 'language_practice' ? 'en-US' : 'en-PH';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputPrompt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setAudioSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [mode]);

  const [micNotice, setMicNotice] = useState<string | null>(null);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setMicNotice('Speech recognition is not supported in this browser. You can type your question below.');
      setTimeout(() => setMicNotice(null), 4000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      // Auto-send if there's text
      if (inputPrompt.trim()) {
        setTimeout(() => handleSendMessage(inputPrompt), 200);
      }
    } else {
      setInputPrompt('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playTTS = async (text: string) => {
    stopAudio();
    setIsSpeaking(true);

    try {
      // Call server /api/tts endpoint (powered by gemini-3.8-flash-lite-tts)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });

      const data = await res.json();

      if (data.audio) {
        const audio = new Audio(data.audio);
        currentAudioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audio.play();
      } else {
        fallbackSpeechSynthesis(text);
      }
    } catch (err) {
      console.warn('TTS request error, falling back to speech synthesis:', err);
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    stopAudio();
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = {
        currentModel,
        currentSeries,
        srp: calculation.srp,
        downPayment: calculation.downPaymentAmount,
        downPaymentPercent: calculation.downPaymentPercent,
        termMonths: calculation.termMonths,
        monthlyAmortization: calculation.monthlyAmortization,
        totalCashOut: calculation.totalCashOut,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          mode,
          context,
        }),
      });

      const data = await res.json();
      const reply = data.text || "I'm ready to answer any questions about CFMOTO motorcycle loans and financing options!";

      const botMsg: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (autoSpeak) {
        playTTS(reply);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content:
          "I'm here! For the " +
          currentModel +
          ', your calculated monthly amortization is ' +
          formatPHP(calculation.monthlyAmortization) +
          ' for ' +
          calculation.termMonths +
          ' months. You can submit your application anytime using the Loan Application tab!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    stopAudio();
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content:
          mode === 'loan_consultant'
            ? `Conversation reset. Ask me anything about our CFMOTO lineup, down payment options, or requirements!`
            : `Practice session started! Let's practice dealership negotiation or customer service in English, Tagalog, or Taglish. How can I help you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickStarters =
    mode === 'loan_consultant'
      ? [
          `How much is the ${currentModel} monthly for ${calculation.termMonths} months?`,
          'What are the requirements for Angkas or Grab riders?',
          'Which CFMOTO model is best for city commuting and long tours?',
          'Where is your showroom located and what are showroom hours?',
        ]
      : [
          'Magkano po ang pinakamababang down payment para sa motor?',
          'Pwede po ba magtanong tungkol sa installment requirements in Tagalog?',
          'Let’s practice negotiating a motorcycle purchase in English',
          'How do I politely inquire about motorcycle freebies in Filipino?',
        ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner / Mode Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Conversational AI Loan Partner
              </h2>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Gemini Voice
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Context: <strong className="text-amber-400">CFMOTO {currentModel}</strong> ({formatPHP(calculation.srp)}) • Term: {calculation.termMonths} Mos
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setMode('loan_consultant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'loan_consultant'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Loan Consultant</span>
          </button>
          <button
            onClick={() => setMode('language_practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'language_practice'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Language Partner</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[580px] overflow-hidden relative">
        {/* Chat Header Toolbar */}
        <div className="bg-slate-850/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Live Audio indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSpeaking
                    ? 'bg-emerald-400 animate-pulse'
                    : isRecording
                    ? 'bg-rose-500 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-semibold text-slate-300">
                {isSpeaking
                  ? 'Speaking response...'
                  : isRecording
                  ? 'Listening to microphone...'
                  : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto speak toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopAudio();
                setAutoSpeak(!autoSpeak);
              }}
              title="Toggle Auto Spoken Voice"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                autoSpeak
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Voice {autoSpeak ? 'ON' : 'OFF'}</span>
            </button>

            {/* Voice Persona Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1"
            >
              <option value="Kore">Voice: Kore (Natural)</option>
              <option value="Puck">Voice: Puck (Energetic)</option>
              <option value="Zephyr">Voice: Zephyr (Calm)</option>
              <option value="Fenrir">Voice: Fenrir (Deep)</option>
            </select>

            {/* Clear conversation */}
            <button
              onClick={handleClearHistory}
              title="Reset conversation"
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-md shadow-amber-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                    isBot
                      ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  <div
                    className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
                      isBot ? 'border-slate-700 text-slate-400' : 'border-amber-600/40 text-slate-900'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => playTTS(msg.content)}
                        className="hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Replay voice"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Speak</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Thinking and analyzing loan calculations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Suggested:</span>
          {quickStarters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(starter)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Notice banner if mic not supported */}
        {micNotice && (
          <div className="bg-amber-500/15 border-t border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
            <span>{micNotice}</span>
            <button
              onClick={() => setMicNotice(null)}
              className="text-amber-400 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Audio Visualizer Bar when Recording or Speaking */}
        {(isRecording || isSpeaking) && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-400">
            <div className="flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="w-1 h-3 bg-amber-400 animate-bounce" />
                <span className="w-1 h-4 bg-amber-400 animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-2 bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-5 bg-amber-400 animate-bounce [animation-delay:0.15s]" />
              </span>
              <span className="font-semibold">
                {isRecording ? 'Listening... Speak into your microphone' : 'Playing spoken response...'}
              </span>
            </div>
            {isSpeaking && (
              <button
                onClick={stopAudio}
                className="text-[11px] underline hover:text-amber-300 cursor-pointer"
              >
                Stop Audio
              </button>
            )}
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
              }`}
              title={isRecording ? 'Click to stop listening' : 'Click to speak using microphone'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                mode === 'loan_consultant'
                  ? `Ask about CFMOTO ${currentModel}, loans, requirements, or Caloocan dealership...`
                  : `Type or speak in English or Tagalog to practice motorcycle conversation...`
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 p-3 rounded-2xl font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
