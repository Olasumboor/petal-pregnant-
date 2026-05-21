import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { VitalsProfile } from "../types";
import { Send, RefreshCw, Sparkles, AlertTriangle, ArrowDown } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AskAIProps {
  vitals: VitalsProfile;
  drNotes: string;
  week: number;
}

export default function AskAI({ vitals, drNotes, week }: AskAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hello! I'm Petal, your private, intelligent pregnancy ally. 🌸

I can analyze your symptoms, help decode labor twinges, suggest recipes, and summarize advice.

If you log your clinic stats in the **My Results** tab, I'll automatically adapt my medical guides to your exact numbers (A1C, hemoglobin, ferritin)!

What is on your mind today?`,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll effect
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || sending) return;

    // Add user bubble
    const userMsg: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      // Map user/model history structure
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          week,
          vitals,
          drNotes,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: "Oops, I encountered a response error. Please ask once more!" },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Network connection loss. Unable to talk to Petal servers inside AI Studio." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const runPresetChat = (txt: string) => {
    handleSendMessage(txt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 flex flex-col h-[calc(100vh-150px)]"
    >
      <div className="space-y-1 shrink-0">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Talk to Petal Ally</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ END-TO-END SECURE GESTATIONAL COUNSEL WITH PETAL'S DYNAMIC INTELLIGENCE ENGINE ]
        </p>
      </div>

      {/* Chat Windows frame */}
      <div className="bg-white/5 border border-white/10 rounded-none flex-1 flex flex-col overflow-hidden glass">
        {/* Scrollable feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white/[0.01]">
          {messages.map((m, idx) => {
            const isMe = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
              >
                <span className="font-mono text-[8px] tracking-[0.2em] text-white/40 uppercase px-1">
                  {isMe ? "[ CLIENT REQUEST ]" : "[ PETAL INTELLIGENCE DIRECTIVE ]"}
                </span>
                <div
                  className={`max-w-[85%] rounded-none px-4 py-3 text-xs leading-relaxed ${
                    isMe
                      ? "bg-[#FF3E00]/10 border border-[#FF3E00] text-white"
                      : "bg-white/5 border border-white/10 text-white/95 whitespace-pre-line font-light"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex flex-col items-start space-y-1">
              <span className="font-mono text-[8px] tracking-[0.2em] text-[#FF3E00] uppercase animate-pulse">
                [ PETAL SYNTHESIZER RUNNING... ]
              </span>
              <div className="bg-white/5 border border-[#FF3E00]/20 rounded-none px-4.5 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#FF3E00] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-none bg-[#FF3E00] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-none bg-[#FF3E00] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Anchor to scroll */}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar row */}
        <div className="p-4 border-t border-white/10 bg-white/5 space-y-3 shrink-0">
          {/* Preset question chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap sm:flex-nowrap">
            {[
              "Is spotting common in this gestational phase?",
              "What micronutrients are prioritized right now?",
              "What structural weight speed is safe for my BMI?",
              "What obstetric alarm signs call for diagnostic emergency?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => runPresetChat(q)}
                disabled={sending}
                className="text-[9px] font-mono bg-white/5 border border-white/10 text-white/50 hover:border-[#FF3E00] hover:text-[#FF3E00] rounded-none px-3 py-1 transition whitespace-nowrap cursor-pointer disabled:opacity-40 uppercase tracking-widest"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sending}
              placeholder="Query fetal biology weight curves, glucose parameters, calcium balances..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/15 text-white text-xs outline-none rounded-none px-4 py-3.5 transition placeholder:text-white/20 select-text leading-relaxed"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || sending}
              className="p-3.5 rounded-none bg-[#FF3E00] border border-[#FF3E00] text-white hover:bg-white hover:text-black cursor-pointer disabled:opacity-40 transition-colors"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 font-mono text-[8px] text-white/30 uppercase tracking-widest px-1">
            <span>GESTATIONAL COMPILATION ANALYSIS INTERCONNECT</span>
            <span className="flex items-center gap-1 text-[#FF3E00] font-bold">
              <AlertTriangle className="w-3 h-3 text-[#FF3E00] fill-[#FF3E00]/10" /> DISCLAIMER: CONSULT CLINICAL OB FOR MEDICAL ACTION
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
