import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Appointment } from "../types";
import { Calendar, Sparkles, CheckCircle2, AlertCircle, X, Trash2 } from "lucide-react";

interface AppointmentsProps {
  appts: Appointment[];
  onAddAppt: (appt: Appointment) => void;
  onToggleAppt: (id: string) => void;
  onDeleteAppt: (id: string) => void;
}

export default function Appointments({
  appts,
  onAddAppt,
  onToggleAppt,
  onDeleteAppt,
}: AppointmentsProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a clear title (e.g., Week 12 Anatomy Scan)!");
      return;
    }

    const newAppt: Appointment = {
      id: "appt_" + Date.now(),
      title: title.trim(),
      date: date || "TBD",
      note: note.trim() || undefined,
      done: false,
    };

    onAddAppt(newAppt);

    // Reset fields
    setTitle("");
    setDate("");
    setNote("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Prenatal Appointment Planner</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ RECORD CLINICAL SCANS AND PHYSICIAN ENCOUNTERS TO GUARANTEE INTERCONNECTIVITIES ]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form card */}
        <div className="bg-white/5 border border-white/10 rounded-none p-6 space-y-4 h-fit glass">
          <div className="flex items-center gap-2 text-white/40 border-b border-white/10 pb-3">
            <Calendar className="w-4 h-4 text-[#FF3E00]" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">[ NEW DIAGNOSTIC ENCOUNTER ]</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Session Headline / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Week 12 Anatomy Scan or Clinic checkup"
                className="w-full text-xs bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 text-white outline-none rounded-none px-4 py-3 placeholder:text-white/20 select-text leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Assigned Visit Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 text-white outline-none rounded-none px-4 py-3 select-text leading-relaxed font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest block">Diagnostic Focus Agenda Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Request iron supplementation clearance, blood sugar results review, amniotic fluid counts..."
                className="w-full text-xs bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 text-white outline-none rounded-none p-3.5 h-20 min-h-[60px] resize-y placeholder:text-white/20 select-text leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-none bg-[#FF3E00] border border-[#FF3E00] text-white font-mono uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-black hover:border-white transition-all duration-200 cursor-pointer"
            >
              COMMIT RECORD TO PLANNER
            </button>
          </form>
        </div>

        {/* List Card list */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/40">
            <Calendar className="w-4 h-4 text-[#FF3E00] animate-pulse" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">[ ACTIVE ENCOUNTER SCHEDULE TIMELINE ]</span>
          </div>

          {appts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-none p-10 text-center text-white/50 glass">
              <AlertCircle className="w-8 h-8 text-[#FF3E00]/40 stroke-1 mx-auto mb-3 animate-pulse" />
              <p className="font-mono text-xs uppercase tracking-widest text-[#FF3E00]">VISIT STREAM IS EMPTY</p>
              <p className="text-[10px] font-light text-white/40 mt-1">Submit scheduled checks above to establish fetal wellness checkpoints.</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {appts.map((appt) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={appt.id}
                    className="p-4 rounded-none bg-white/5 border border-white/10 flex items-start gap-4 transition duration-150 hover:bg-white/[0.08] relative group border-l-4 border-l-[#FF3E00] glass"
                  >
                    <button
                      onClick={() => onToggleAppt(appt.id)}
                      className={`w-5 h-5 shrink-0 rounded-none border flex items-center justify-center transition cursor-pointer ${
                        appt.done
                          ? "bg-[#FF3E00] border-[#FF3E00] text-white"
                          : "border-white/20 bg-white/5 hover:border-[#FF3E00]"
                      }`}
                      aria-label="Toggle completed appointment"
                    >
                      {appt.done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <div className="space-y-1.5 pr-8 flex-1">
                      <h4
                        className={`text-xs font-mono font-bold uppercase tracking-wider transition ${
                          appt.done ? "text-white/40 line-through decoration-white/20" : "text-white"
                        }`}
                      >
                        {appt.title}
                      </h4>
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        📅 DATE: {appt.date}
                      </p>
                      {appt.note && (
                        <p className={`text-xs leading-relaxed pt-1 font-light ${appt.done ? "text-white/35" : "text-white/75"}`}>
                          {appt.note}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteAppt(appt.id)}
                      className="absolute top-4 right-3 text-white/30 hover:text-[#FF3E00] hover:bg-white/5 p-1 transition cursor-pointer rounded-none"
                      aria-label="Delete appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
