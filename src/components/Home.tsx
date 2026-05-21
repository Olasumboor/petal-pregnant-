import React, { useState } from "react";
import { motion } from "motion/react";
import { VitalsProfile, JournalEntry, getWeekData } from "../types";
import { Sparkles, Heart, Scale, CalendarDays, Activity } from "lucide-react";

interface HomeProps {
  displayName?: string;
  week: number;
  onWeekChange: (w: number) => void;
  vitals: VitalsProfile;
  drNotes: string;
  entries: JournalEntry[];
  onAddHM: (emoji: string, label: string) => void;
}

export default function Home({
  displayName,
  week,
  onWeekChange,
  vitals,
  drNotes,
  entries,
  onAddHM,
}: HomeProps) {
  const d = getWeekData(week);
  const pct = Math.min(100, Math.round((week / 40) * 100));
  const [selectedMoodLocal, setSelectedMoodLocal] = useState<{ emoji: string; label: string } | null>(null);

  // Generate visual summary based on entered clinic parameters
  const generateLocalSummary = () => {
    const parts: string[] = [];
    if (vitals.hgb) {
      const low = parseFloat(vitals.hgb) < 10.5;
      parts.push(
        low
          ? "[ HEMOGLOBIN INDICATOR ]: Index is lower than ideal (10.5 g/dL). Recommend iron-dense proteins & greens paired alongside Vitamin C catalysts to optimize assimilation."
          : "[ CLINICAL STATUS ]: Blood panel hemoglobin counts are in optimal healthy bounds."
      );
    }
    if (vitals.a1c) {
      const hi = parseFloat(vitals.a1c) > 5.6;
      parts.push(
        hi
          ? "[ GLYCEMIC BALANCE ]: HbA1C presents a borderline profile level. Stabilize intake using slow-carb nutrients and avoid refined sugars."
          : "[ GLYCEMIC BALANCE ]: Glucose levels are within secure baseline targets."
      );
    }
    if (vitals.bp) {
      const sys = parseInt(vitals.bp.split("/")[0]) || 0;
      if (sys >= 140) {
        parts.push(
          "[ BLOOD PRESSURE ]: Systolic BP is elevated (>= 140 mmHg). Minimize sodium inputs and coordinate immediate diagnostic review."
        );
      } else {
        parts.push("[ BLOOD PRESSURE ]: Cardiovascular pressure markers present stable figures.");
      }
    }
    if (vitals.wt && vitals.ht) {
      const w = parseFloat(vitals.wt);
      const h = parseFloat(vitals.ht);
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        const bmi = (w / (h * h)) * 703;
        if (bmi < 18.5) {
          parts.push("[ MATERNAL WEIGHT ]: BMI reports lightweight profile. Integrate healthy lipid fats and high-protein elements.");
        } else if (bmi > 30) {
          parts.push("[ MATERNAL WEIGHT ]: BMI reports elevated tier profile. Regular macro portion spacing is advised.");
        }
      }
    }
    if (drNotes) {
      parts.push(`[ CLINICIAN LOG ]: "${drNotes.substring(0, 100)}${drNotes.length > 100 ? "..." : ""}"`);
    }

    return parts;
  };

  const summaryPoints = generateLocalSummary();

  const handleSaveCheckIn = () => {
    if (!selectedMoodLocal) return;
    onAddHM(selectedMoodLocal.emoji, selectedMoodLocal.label);
    setSelectedMoodLocal(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      id="home-screen"
      className="space-y-6"
    >
      {/* Hero card tracker (Sleek Gallery Frame Style) */}
      <div 
        id="hero-banner"
        className="relative overflow-hidden p-8 text-white border-2 border-[#FF3E00] glass rounded-none"
      >
        {/* Subtle geometric neon line element */}
        <div className="absolute right-0 top-0 h-16 w-[2px] bg-[#FF3E00]" />
        <div className="absolute right-0 top-0 w-16 h-[2px] bg-[#FF3E00]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-[#FF3E00] uppercase block">
              [ {displayName ? `MATERNAL PROFILE: ${displayName}` : "CASE PROFILE: GE-40"} ]
            </span>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-8xl font-black tracking-tighter leading-none text-white">{week}</h1>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-[0.2em] text-[#FF3E00] uppercase">WEEKS</span>
                <span className="text-[10px] uppercase font-light text-white/70">GESTATING</span>
              </div>
            </div>
            <div className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-[10px] font-semibold uppercase tracking-wider rounded-none">
              CURRENT EXH: {d.tri}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/10 rounded-none max-w-sm glass">
            <div className="text-5xl shrink-0 filter brightness-110" role="img" aria-label="baby counterpart size fruit">
              {d.fruit}
            </div>
            <div>
              <p className="font-mono text-[9px] text-[#FF3E00] uppercase font-bold tracking-[0.2em]">
                SIZE REFERENCE INDEX
              </p>
              <p className="text-xs font-light text-white/90 leading-relaxed">
                Fetus has scaled to the comparable dimensions of a <span className="font-bold underline decoration-[#FF3E00] underline-offset-4">{d.size}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic week slider timeline track - Linear Minimalist Style */}
        <div className="mt-8 space-y-3">
          <div className="flex justify-between font-mono text-[10px] text-white/50">
            <span>START (WK 01)</span>
            <span className="text-[#FF3E00]">DEVELOPMENT: {pct}% COMPLETE</span>
            <span>TERM (WK 40)</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-none overflow-hidden">
            <div 
              className="h-full bg-[#FF3E00] transition-all duration-1000 ease-out" 
              style={{ width: `${pct}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Baby & Mom developments panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baby progress */}
        <div className="bg-white/30 border border-white/10 glass rounded-none p-6 space-y-3 border-l-4 border-l-[#FF3E00]">
          <div className="flex items-center gap-2 text-white/80">
            <Heart className="w-3.5 h-3.5 text-[#FF3E00]" />
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-white/50">
              FETAL BIOLOGY • WK {week}
            </span>
          </div>
          <p className="text-white/80 leading-relaxed text-xs font-light">
            {d.baby}
          </p>
        </div>

        {/* Mom changes */}
        <div className="bg-white/30 border border-white/10 glass rounded-none p-6 space-y-3 border-l-4 border-l-[#FF3E00]">
          <div className="flex items-center gap-2 text-white/80">
            <Activity className="w-3.5 h-3.5 text-[#FF3E00]" />
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-white/50">
              BIO-SYNERGY • WK {week}
            </span>
          </div>
          <p className="text-white/80 leading-relaxed text-xs font-light">
            {d.mom}
          </p>
        </div>
      </div>

      {/* Health diagnostics overview custom panel */}
      <div className="bg-white/30 border border-white/10 glass rounded-none p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#FF3E00]">
          <Scale className="w-4 h-4" />
          <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-white/50">
            HEALTH SUMMARY RECORD
          </span>
        </div>
        {summaryPoints.length === 0 ? (
          <p className="text-white/60 text-xs leading-relaxed font-light">
            No bio-metrics logged yet. Input medical vitals inside the{" "}
            <strong className="text-white decoration-[#FF3E00] underline font-bold">My Results</strong> tab to calculate BMI limits, evaluate bio-markers, and feed this central dashboard summary.
          </p>
        ) : (
          <div className="space-y-2">
            {summaryPoints.map((pt, index) => (
              <div 
                key={index} 
                className="p-3.5 bg-white/[0.02] border border-white/5 text-white/90 font-mono text-[11px] leading-relaxed relative"
              >
                <div className="absolute left-0 top-0 h-full w-[3px] bg-[#FF3E00]" />
                {pt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week Timeline Select Strip (Clean Monospaced Grid) */}
      <div className="bg-white/30 border border-white/10 glass rounded-none p-6 space-y-4">
        <div className="flex items-center gap-2 text-white/50">
          <CalendarDays className="w-4 h-4" />
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase">
            TIMELINE MATRIX INDEX (SELECT TO PREVIEW)
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none snap-x Scroll-Contain">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === week;
            const isCompleted = w < week;
            return (
              <button
                key={w}
                onClick={() => onWeekChange(w)}
                className={`snap-center flex-shrink-0 w-11 h-11 rounded-none flex flex-col items-center justify-center font-mono text-xs transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? "bg-[#FF3E00] text-white font-black border border-[#FF3E00]"
                    : isCompleted
                    ? "bg-[#FF3E00]/10 text-white border border-[#FF3E00]/40"
                    : "bg-white/5 text-white/50 border border-white/10 hover:border-white/30 hover:text-white"
                }`}
                aria-label={`Jump to Week ${w}`}
              >
                <span>{w.toString().padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Check-In Layout */}
      <div className="bg-white/30 border border-white/10 glass rounded-none p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white/80">
            <Heart className="w-4 h-4 text-[#FF3E00]" />
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-white/50">
              MOOD LOG MATRIX
            </span>
          </div>
          {selectedMoodLocal && (
            <span className="font-mono text-[10px] font-bold text-[#FF3E00] uppercase tracking-wider">
              [ SELECTED: {selectedMoodLocal.emoji} {selectedMoodLocal.label} ]
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[
            { emoji: "😊", label: "Happy" },
            { emoji: "🤢", label: "Nauseous" },
            { emoji: "😴", label: "Tired" },
            { emoji: "😰", label: "Anxious" },
            { emoji: "🥰", label: "Loved" },
            { emoji: "😣", label: "Crampy" },
            { emoji: "🌟", label: "Glowing" },
            { emoji: "😔", label: "Low" },
          ].map((item) => {
            const isSelected = selectedMoodLocal?.label === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedMoodLocal(item)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-none transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#FF3E00]/10 border-[#FF3E00] text-white scale-102"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className="text-xl" role="img" aria-label={item.label}>
                  {item.emoji}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveCheckIn}
            disabled={!selectedMoodLocal}
            className="px-8 py-3.5 border border-[#FF3E00]/45 bg-[#FF3E00] hover:bg-white hover:text-black hover:border-white text-white font-mono uppercase tracking-widest text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            SUBMIT LOG ENTRY
          </button>
        </div>
      </div>
    </motion.div>
  );
}

