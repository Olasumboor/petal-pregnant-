import React from "react";
import { motion } from "motion/react";
import { ListTodo, CheckSquare, Calendar, Milestone } from "lucide-react";

interface ChecklistProps {
  checks: Record<string, boolean>;
  onToggleCheck: (key: string) => void;
}

const CHECKLIST_DATA = {
  t1: {
    title: "First Trimester Tasks (Weeks 1–13)",
    badge: "EARLIEST",
    css: "border-[#FF3E00] text-[#FF3E00] bg-[#FF3E00]/10",
    items: [
      "Schedule your first prenatal OB/GYN confirmation visit",
      "Upgrade to daily prenatal vitamins with folic acid (400–800 mcg)",
      "Log initial baseline blood panel biomarkers in this applet",
      "Confirm early gestation and rule out ectopic risks via early scan",
      "Discuss all high-priority current prescription safe levels with your doctor",
      "Establish hydration habits (aim for 8–10 fluid cups daily)",
      "Zero out alcohol consumption completely and reduce caffeine indices",
      "Map out mid-to-long term midwife or clinical pediatric networks",
      "Get a prenatal blood typing and Rh antibodies check done",
      "Begin standard journal symptom entries under our Journal interface",
    ],
  },
  t2: {
    title: "Second Trimester Milestones (Weeks 14–26)",
    badge: "ACTIVE",
    css: "border-white/25 text-white/90 bg-white/10",
    items: [
      "Schedule your high-resolution fetal Anatomy Scan (weeks 18–22)",
      "Take your routine 1-hour Gestational Glucose screening test",
      "Confirm blood index checks for iron and ferritin levels",
      "Register for local childbirth education and newborn care classes",
      "Begin stretching exercises or prenatal pelvic floor routines",
      "Review maternity leave, state policies, and child insurance limits",
      "Invest in healthy, supportive orthopedic pillows & loose clothing",
      "Start daily kick counts (aim to record 10 kicks within 2 resting hours)",
      "Decorate or set aside nursery cabinets and baby clothing bins",
      "Document a preliminary birth plan outlining pain mitigation and comfort choices",
    ],
  },
  t3: {
    title: "Third Trimester preparations (Weeks 27–40)",
    badge: "IMMEDIATE",
    css: "border-[#FF3E00] text-[#FF3E00] bg-[#FF3E00]/10",
    items: [
      "Confirm hospital route, pre-registration parameters, and entry codes",
      "Pack your birth support suite go-bag (clothes, toiletries, baby blanket)",
      "Purchase, install, and properly adjust a certified rear-facing car seat",
      "Complete pediatric clinics selection process and list contact keys",
      "Attend weekly checkups starting at Week 36 for position scans",
      "Wash baby sheets, onesies, and nursing towels using dye-free wash",
      "Meal prep and stock your home freezer with postpartum macro dinners",
      "Double check pain control or epidural desires with your delivery nurse",
      "Finalize back-up schedules for dog sitting, nursery helpers, or transit",
      "Keep tracking fetal movements daily and call your OB for sudden drops in activity",
    ],
  },
};

export default function Checklist({ checks, onToggleCheck }: ChecklistProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Pregnancy Timeline Checklist</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ TRIMESTER-BY-TRIMESTER BIO-LOGISTICAL TASKS TO PRESERVE COMPOSURE AND SAFETY ]
        </p>
      </div>

      <div className="space-y-6">
        {(Object.keys(CHECKLIST_DATA) as Array<keyof typeof CHECKLIST_DATA>).map((sectionKey) => {
          const section = CHECKLIST_DATA[sectionKey];
          return (
            <div
              key={sectionKey}
              className="bg-white/5 border border-white/10 rounded-none p-6 relative overflow-hidden border-t-2 border-t-[#FF3E00] glass"
            >
              {/* Top Banner section */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-white/40" />
                  <h3 className="font-mono text-xs uppercase font-bold text-white tracking-widest leading-none">{section.title}</h3>
                </div>
                <span className={`text-[9px] font-mono font-bold tracking-[0.15em] uppercase border px-2.5 py-1 rounded-none ${section.css}`}>
                  {section.badge}
                </span>
              </div>

              {/* Checkbox grid timeline line */}
              <div className="space-y-1">
                {section.items.map((item, idx) => {
                  const itemKey = `${sectionKey}_${idx}`;
                  const isDone = checks[itemKey] || false;
                  return (
                    <div
                      key={idx}
                      onClick={() => onToggleCheck(itemKey)}
                      className={`flex items-start gap-3.5 py-2 px-2 rounded-none transition duration-150 cursor-pointer select-none ${
                        isDone 
                          ? "bg-white/[0.01]" 
                          : "hover:bg-white/5"
                      }`}
                    >
                      <button
                        className={`w-5 h-5 shrink-0 rounded-none border flex items-center justify-center transition cursor-pointer ${
                          isDone
                            ? "bg-[#FF3E00] border-[#FF3E00] text-white"
                            : "border-white/20 bg-white/5 hover:border-white/45"
                        }`}
                        aria-label={`Mark task ${item} done`}
                        aria-checked={isDone}
                      >
                        {isDone && <CheckSquare className="w-3.5 h-3.5 fill-current stroke-0" />}
                      </button>
                      <span
                        className={`text-xs leading-relaxed font-light transition ${
                          isDone 
                            ? "text-white/40 line-through decoration-white/20 font-mono text-[10px]" 
                            : "text-white/85"
                        }`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
