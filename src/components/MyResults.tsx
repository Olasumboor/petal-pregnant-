import React, { useState } from "react";
import { motion } from "motion/react";
import { VitalsProfile } from "../types";
import { Stethoscope, Sparkles, Scale, HeartPulse, ChevronRight } from "lucide-react";

interface MyResultsProps {
  vitals: VitalsProfile;
  onChangeVitals: (v: VitalsProfile) => void;
  drNotes: string;
  onChangeDrNotes: (s: string) => void;
  week: number;
}

export default function MyResults({
  vitals,
  onChangeVitals,
  drNotes,
  onChangeDrNotes,
  week,
}: MyResultsProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");

  const updateField = (key: keyof VitalsProfile, value: string) => {
    onChangeVitals({
      ...vitals,
      [key]: value,
    });
  };

  // Immediate clinical validation feedback
  const getValidation = (key: keyof VitalsProfile, valStr?: string) => {
    if (!valStr) return { status: "Not entered", css: "bg-slate-100 text-slate-500" };
    const n = parseFloat(valStr);
    if (isNaN(n)) return { status: "Invalid Data", css: "bg-red-50 text-red-500" };

    switch (key) {
      case "hgb": // Hemoglobin (10.5 - 16)
        return n < 10.5
          ? { status: "▼ Low (under 10.5)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 16.0
          ? { status: "▲ High (over 16.0)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      case "hct": // Hematocrit (33 - 46)
        return n < 33.0
          ? { status: "▼ Low (under 33%)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 46.0
          ? { status: "▲ High (over 46%)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      case "wbc": // WBC (4.5 - 11)
        return n < 4.5
          ? { status: "▼ Low (under 4.5)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 11.0
          ? { status: "▲ High (over 11.0)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      case "plt": // Platelets (150 - 400)
        return n < 150
          ? { status: "▼ Low (under 150)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 400
          ? { status: "▲ High (over 400)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      case "a1c": // HbA1C (under 5.6)
        return n > 5.6
          ? { status: "▲ Elevated (over 5.6%)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal (under 5.6%)", css: "bg-emerald-50 text-emerald-700" };
      case "glu": // Fasting glucose (60 - 95 mg/dL)
        return n < 60
          ? { status: "▼ Low (under 60)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 95
          ? { status: "▲ Elevated (over 95)", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      case "fer": // Ferritin (12 - 150)
        return n < 12
          ? { status: "▼ Low (Anemia Risk)", css: "bg-amber-100 text-amber-700 font-semibold" }
          : n > 150
          ? { status: "▲ High", css: "bg-red-100 text-red-700 font-semibold" }
          : { status: "✓ Normal", css: "bg-emerald-50 text-emerald-700" };
      default:
        return { status: "Saved", css: "bg-emerald-50 text-emerald-600" };
    }
  };

  const getWeightBMIReport = () => {
    const w = parseFloat(vitals.wt || "");
    const h = parseFloat(vitals.ht || "");
    if (isNaN(w) || isNaN(h) || h <= 0) return { bmi: "--", label: "Enter height & weight", css: "text-slate-400" };
    const b = (w / (h * h)) * 703;
    const bmi = b.toFixed(1);

    if (b < 18.5) return { bmi, label: "Underweight BMI", css: "bg-amber-100 text-amber-700 font-bold" };
    if (b > 30) return { bmi, label: "Elevated BMI", css: "bg-red-100 text-red-700 font-bold" };
    return { bmi, label: "Healthy BMI range", css: "bg-emerald-50 text-emerald-700" };
  };

  const bmiData = getWeightBMIReport();

  const handleFetchAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals,
          drNotes,
          week,
          bmi: bmiData.bmi !== "--" ? bmiData.bmi : undefined,
        }),
      });
      const data = await response.json();
      if (data.text) {
        setAiReport(data.text);
      } else {
        setAiReport("Unable to generate analysis. Please try again.");
      }
    } catch (e) {
      setAiReport("Network error occurred during clinical analysis. Please verify your internet connection.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Results Vault</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ TIMELINE OF GESTATIONAL BIO-MARKERS & CLINICAL METRICS ]
        </p>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 gap-6">
        {/* Blood Count Panel */}
        <div className="bg-white/5 border border-white/10 glass rounded-none p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#FF3E00] border-b border-white/10 pb-3">
            <HeartPulse className="w-4 h-4" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">COMPLETE BLOOD COUNT (CBC)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hemoglobin */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Hemoglobin</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("hgb", vitals.hgb).css}`}>
                  {getValidation("hgb", vitals.hgb).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 12.5"
                  step="0.1"
                  value={vitals.hgb || ""}
                  onChange={(e) => updateField("hgb", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">g/dL</span>
              </div>
            </div>

            {/* Hematocrit */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Hematocrit</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("hct", vitals.hct).css}`}>
                  {getValidation("hct", vitals.hct).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 38.2"
                  step="0.1"
                  value={vitals.hct || ""}
                  onChange={(e) => updateField("hct", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">%</span>
              </div>
            </div>

            {/* WBC */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">WBC Count</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("wbc", vitals.wbc).css}`}>
                  {getValidation("wbc", vitals.wbc).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 8.2"
                  step="0.1"
                  value={vitals.wbc || ""}
                  onChange={(e) => updateField("wbc", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">K/µL</span>
              </div>
            </div>

            {/* Platelets */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Platelets</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("plt", vitals.plt).css}`}>
                  {getValidation("plt", vitals.plt).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 240"
                  step="1"
                  value={vitals.plt || ""}
                  onChange={(e) => updateField("plt", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">K/µL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Glycemic Markers Panel */}
        <div className="bg-white/5 border border-white/10 glass rounded-none p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#FF3E00] border-b border-white/10 pb-3">
            <Stethoscope className="w-4 h-4" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">METABOLIC GLYCEMIC INDICES</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HbA1c */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">HbA1C Percent</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("a1c", vitals.a1c).css}`}>
                  {getValidation("a1c", vitals.a1c).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 5.1"
                  step="0.1"
                  value={vitals.a1c || ""}
                  onChange={(e) => updateField("a1c", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">%</span>
              </div>
            </div>

            {/* Fasting Glucose */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Fasting Glucose</span>
                <span className={`text-[8px] px-2 py-0.5 border font-mono tracking-wider ${getValidation("glu", vitals.glu).css}`}>
                  {getValidation("glu", vitals.glu).status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="e.g., 85"
                  step="1"
                  value={vitals.glu || ""}
                  onChange={(e) => updateField("glu", e.target.value)}
                  className="w-full text-base font-bold bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none px-3 py-1.5 text-white"
                />
                <span className="font-mono text-[10px] text-white/40 uppercase font-bold">mg/dL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Biometrics & Vitals */}
        <div className="bg-white/5 border border-white/10 glass rounded-none p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#FF3E00] border-b border-white/10 pb-3">
            <Scale className="w-4 h-4" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">PHYSICAL VITAL BIOMETRICS</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weight */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-1">
              <span className="font-mono text-[9px] text-white/50 uppercase tracking-widest font-bold">Weight (lbs)</span>
              <input
                type="number"
                placeholder="e.g., 142"
                value={vitals.wt || ""}
                onChange={(e) => updateField("wt", e.target.value)}
                className="w-full text-sm font-bold bg-white/5 border border-white/10 outline-none rounded-none px-3 py-1.5 focus:border-[#FF3E00] text-white"
              />
            </div>

            {/* Height */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-1">
              <span className="font-mono text-[9px] text-white/50 uppercase tracking-widest font-bold">Height (in)</span>
              <input
                type="number"
                placeholder="e.g., 65"
                value={vitals.ht || ""}
                onChange={(e) => updateField("ht", e.target.value)}
                className="w-full text-sm font-bold bg-white/5 border border-white/10 outline-none rounded-none px-3 py-1.5 focus:border-[#FF3E00] text-white"
              />
            </div>

            {/* Blood Pressure */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-1">
              <span className="font-mono text-[9px] text-white/50 uppercase tracking-widest font-bold">Blood Pressure</span>
              <input
                type="text"
                placeholder="120/80"
                value={vitals.bp || ""}
                onChange={(e) => updateField("bp", e.target.value)}
                className="w-full text-sm font-bold bg-white/5 border border-white/10 outline-none rounded-none px-3 py-1.5 focus:border-[#FF3E00] text-white"
              />
            </div>

            {/* Ferritin / Iron */}
            <div className="bg-white/[0.02] p-4 border border-white/10 rounded-none space-y-1">
              <div className="flex justify-between items-center font-mono text-[9px] text-white/50 uppercase tracking-widest font-bold">
                <span>Ferritin</span>
                <span className={`text-[8px] px-1 text-white border ${getValidation("fer", vitals.fer).css}`}>
                  {getValidation("fer", vitals.fer).status.split(" ")[0]}
                </span>
              </div>
              <input
                type="number"
                placeholder="e.g., 35"
                value={vitals.fer || ""}
                onChange={(e) => updateField("fer", e.target.value)}
                className="w-full text-sm font-bold bg-white/5 border border-white/10 outline-none rounded-none px-3 py-1.5 focus:border-[#FF3E00] text-white"
              />
            </div>
          </div>

          {/* Real-time BMI Display Badge - Modern Monospaced */}
          {bmiData.bmi !== "--" && (
            <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/15 rounded-none font-mono text-[10px]">
              <span className="text-white/50 uppercase tracking-widest">BODY MASS COMPUTE:</span>
              <span className={`px-2.5 py-0.5 border ${bmiData.css}`}>
                INDEX: {bmiData.bmi} ({bmiData.label})
              </span>
            </div>
          )}
        </div>

        {/* Doctor's Notes */}
        <div className="bg-white/5 border border-white/10 glass rounded-none p-6 space-y-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
            [ CLINICIAN COMMENTS & DIAGNOSTIC NOTES ]
          </span>
          <textarea
            value={drNotes}
            onChange={(e) => onChangeDrNotes(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none text-xs min-h-[90px] h-28 resize-y placeholder:text-white/20 select-text text-white leading-relaxed"
            placeholder="Log details, supplements suggestions from clinical practitioners directly so Petal AI can incorporate them."
          />
        </div>

        {/* Button & AI Insight Block */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={handleFetchAiAnalysis}
              disabled={analyzing}
              className="px-8 py-3.5 border border-[#FF3E00] bg-[#FF3E00] hover:bg-white hover:text-black hover:border-white text-white font-mono uppercase tracking-widest text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  GENERATING PROFILE REPORT...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  COMPILE AI ASSESS-REPORT
                </>
              )}
            </button>
          </div>

          {/* AI Analysis response box */}
          {(aiReport || analyzing) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white/5 border border-white/10 rounded-none glass space-y-4 relative"
            >
              <div className="absolute left-0 top-0 h-full w-[3px] bg-[#FF3E00]" />
              <div className="flex items-center gap-2 text-[#FF3E00]">
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">[ COMPILATION ANALYSIS ASSESSMENT ]</h4>
              </div>

              {analyzing ? (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-3.5 bg-white/10 rounded-none w-3/4" />
                  <div className="h-3.5 bg-white/10 rounded-none w-[90%]" />
                  <div className="h-3.5 bg-white/10 rounded-none w-5/6" />
                </div>
              ) : (
                <div className="text-white/95 space-y-4 text-xs leading-relaxed whitespace-pre-line font-light">
                  {aiReport}
                </div>
              )}
              
              <div className="pt-3.5 border-t border-white/10 flex items-center justify-between font-mono text-[9px] text-white/40">
                <span>LABORATORY PARAMETER EVALUATION SCHEMA</span>
                <span className="font-bold text-[#FF3E00]">⚠ CONSULT PRIMARY OB FOR FINAL DECISION</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
