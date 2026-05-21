import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { JournalEntry, VitalsProfile } from "../types";
import { Smile, Sparkles, BookOpen, Clock, Heart, Trash2 } from "lucide-react";

interface JournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  week: number;
  vitals: VitalsProfile;
  drNotes: string;
}

const DEFAULT_SYMPTOMS = [
  "Nausea", "Fatigue", "Bloating", "Headache", "Cravings", 
  "Spotting", "Back pain", "Heartburn", "Mood swings", 
  "Insomnia", "Constipation", "Swelling", "Dizziness", 
  "Cramping", "Shortness of breath", "Pelvic pressure"
];

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "🤢", label: "Nauseous" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "😣", label: "Crampy" },
  { emoji: "🌟", label: "Glowing" },
  { emoji: "😔", label: "Low" }
];

export default function Journal({
  entries,
  onSaveEntry,
  onDeleteEntry,
  week,
  vitals,
  drNotes,
}: JournalProps) {
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string } | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const calculateBMI = () => {
    const w = parseFloat(vitals.wt || "");
    const h = parseFloat(vitals.ht || "");
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      return ((w / (h * h)) * 703).toFixed(1);
    }
    return undefined;
  };

  const handleGetAiAdvice = async () => {
    if (!journalText && !selectedMood && selectedSymptoms.length === 0) {
      alert("Please check-in with your mood, note, or symptoms first! I need details to craft personalized coaching.");
      return;
    }

    setAnalyzing(true);
    setAiAdvice("");
    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood?.label,
          symptoms: selectedSymptoms,
          text: journalText,
          week,
          vitals,
          drNotes,
          bmi: calculateBMI()
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiAdvice(data.text);
      } else {
        setAiAdvice("Petal AI was unable to process advice at this moment.");
      }
    } catch (e) {
      setAiAdvice("Connect error. Unable to contact Petal coaching services.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAll = () => {
    if (!selectedMood && !journalText && selectedSymptoms.length === 0) {
      alert("Please select a mood, enter comments, or tick symptoms to preserve as an entry!");
      return;
    }

    const newEntry: JournalEntry = {
      id: "entry_" + Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      week: week,
      mood: selectedMood?.label || "Calm",
      emoji: selectedMood?.emoji || "📓",
      text: journalText,
      symptoms: selectedSymptoms,
      advice: aiAdvice ? aiAdvice : undefined
    };

    onSaveEntry(newEntry);

    // Reset clean state
    setSelectedMood(null);
    setSelectedSymptoms([]);
    setJournalText("");
    setAiAdvice("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Symptom Journal & Coach</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ TRACK DAILY MOOD PATTERNS AND BIOLOGICAL SYMPTOMS IN HIGH FIDELITY ]
        </p>
      </div>

      {/* Main Journal Creator Panel */}
      <div className="bg-white/5 border border-white/10 glass rounded-none p-6 space-y-4">
        {/* Week Pill status */}
        <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
          <span className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest">[ NEW JOURNAL MATRIX ]</span>
          <span className="px-3 py-1 bg-[#FF3E00] text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-none">
            WEEK: {week.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Mood select grid */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest block">
            Select Current Mood State:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {MOODS.map((m) => {
              const isSelected = selectedMood?.label === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-none border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF3E00]/10 border-[#FF3E00] text-white scale-102"
                      : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <span className="text-xl" role="img" aria-label={m.label}>{m.emoji}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Symptoms check tags */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest block">
            Biological Symptoms Log: (Toggle Checklist)
          </label>
          <div className="flex flex-wrap gap-1.5 py-1">
            {DEFAULT_SYMPTOMS.map((sym) => {
              const checked = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={`text-[10px] font-mono px-3.5 py-1.5 rounded-none border transition-all cursor-pointer uppercase ${
                    checked
                      ? "bg-[#FF3E00]/20 text-white border-[#FF3E00]"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Notes textarea */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] font-bold text-white/50 uppercase tracking-widest block">
            Personal diary thoughts & cravings
          </label>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none text-xs min-h-[110px] h-32 resize-y placeholder:text-white/20 select-text text-white leading-relaxed"
            placeholder="Log bodily metrics, emotional movements, baby's heart rates, sleep indices, or any detailed cravings. The richer the log, the more precise the AI customized insight generation."
          />
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
          <button
            onClick={handleGetAiAdvice}
            disabled={analyzing}
            className="px-6 py-2.5 rounded-none border border-[#FF3E00] text-[#FF3E00] hover:bg-[#FF3E00]/10 font-mono text-xs uppercase tracking-widest h-11 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-[#FF3E00]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                GENERATING ADVICE...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#FF3E00]" />
                CONSULT PETAL COACH
              </>
            )}
          </button>

          <button
            onClick={handleSaveAll}
            className="px-8 py-2.5 rounded-none bg-[#FF3E00] hover:bg-white hover:text-black hover:border-white border border-[#FF3E00] text-white font-mono uppercase tracking-widest text-xs font-bold h-11 transition-all duration-200 cursor-pointer"
          >
            COMMIT LOG ENTRY
          </button>
        </div>

        {/* AI response block (Inside current draft) */}
        {aiAdvice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-5 bg-white/[0.02] border border-white/10 rounded-none glass space-y-2.5 mt-4 relative border-l-4 border-l-[#FF3E00]"
          >
            <div className="flex items-center gap-1.5 text-[#FF3E00]">
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
              <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">[ DAILY CARE DIRECTIVE ]</h4>
            </div>
            <p className="text-white/80 text-xs leading-relaxed whitespace-pre-line font-light">
              {aiAdvice}
            </p>
          </motion.div>
        )}
      </div>

      {/* Historic Logs Feed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/40">
          <BookOpen className="w-4 h-4" />
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase">HISTORIC ARCHIVE ENTRIES</span>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white/5 border border-white/10 glass rounded-none p-10 text-center text-white/40">
            <Clock className="w-8 h-8 mx-auto text-[#FF3E00]/40 stroke-1 mb-3 animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#FF3E00]/90">TIMELINE IS VACANT</p>
            <p className="text-[11px] font-light text-white/50 mt-1">Submit check-ins from above to chart physical trends.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3.5">
              {entries.map((entry) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={entry.id}
                  className="bg-white/5 border border-white/10 glass rounded-none p-5 relative transition-all border-l-4 border-l-[#FF3E00]"
                >
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="absolute top-4 right-4 text-white/30 hover:text-[#FF3E00] hover:bg-white/5 p-2 rounded-none transition duration-150 cursor-pointer"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-2.5">
                    {/* Meta information */}
                    <div className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <span>WEEK: {entry.week.toString().padStart(2, "0")}</span>
                      <span>•</span>
                      <span>DATE: {entry.date}</span>
                    </div>

                    {/* Mood header */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xl" role="img" aria-label={entry.mood}>{entry.emoji}</span>
                      <span className="text-xs font-bold text-[#FF3E00] font-mono tracking-widest uppercase">{entry.mood}</span>
                    </div>

                    {/* Diary text if recorded */}
                    {entry.text && (
                      <p className="text-white/90 text-xs leading-relaxed whitespace-pre-line font-light pr-8">
                        {entry.text}
                      </p>
                    )}

                    {/* Symptom tags rendering */}
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {entry.symptoms.map((s) => (
                          <span
                            key={s}
                            className="text-[9px] font-mono bg-white/10 text-white border border-white/15 px-2.5 py-0.5 rounded-none uppercase tracking-wider"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Appended Coach guidance */}
                    {entry.advice && (
                      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-none text-xs text-white/70 font-light cursor-pointer leading-relaxed gap-2 border-l-2 border-l-[#FF3E00]">
                        <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-[#FF3E00] uppercase tracking-wider mb-1">
                          <Heart className="w-3 h-3 fill-current" />
                          COACH ANALYSIS REPORT SUMMARY:
                        </div>
                        {entry.advice}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
