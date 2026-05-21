import React, { useState, useEffect } from "react";
import { JournalEntry, Appointment, VitalsProfile } from "./types";
import Home from "./components/Home";
import MyResults from "./components/MyResults";
import Journal from "./components/Journal";
import Diet from "./components/Diet";
import AskAI from "./components/AskAI";
import Checklist from "./components/Checklist";
import Appointments from "./components/Appointments";
import { Sparkles, Activity } from "lucide-react";

type ActiveTab = "home" | "results" | "journal" | "diet" | "ask" | "checklist" | "appts";

export default function App() {
  // ─── STATE PERSISTENCE ───
  const [week, setWeek] = useState<number>(() => {
    const raw = localStorage.getItem("petal_week");
    return raw ? parseInt(raw, 10) : 1;
  });

  const [vitals, setVitals] = useState<VitalsProfile>(() => {
    const raw = localStorage.getItem("petal_vitals");
    return raw ? JSON.parse(raw) : {};
  });

  const [drNotes, setDrNotes] = useState<string>(() => {
    return localStorage.getItem("petal_drnotes") || "";
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const raw = localStorage.getItem("petal_entries");
    return raw ? JSON.parse(raw) : [];
  });

  const [appts, setAppts] = useState<Appointment[]>(() => {
    const raw = localStorage.getItem("petal_appts");
    return raw ? JSON.parse(raw) : [];
  });

  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    const raw = localStorage.getItem("petal_checks");
    return raw ? JSON.parse(raw) : {};
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize on change
  useEffect(() => {
    localStorage.setItem("petal_week", week.toString());
  }, [week]);

  useEffect(() => {
    localStorage.setItem("petal_vitals", JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem("petal_drnotes", drNotes);
  }, [drNotes]);

  useEffect(() => {
    localStorage.setItem("petal_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("petal_appts", JSON.stringify(appts));
  }, [appts]);

  useEffect(() => {
    localStorage.setItem("petal_checks", JSON.stringify(checks));
  }, [checks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // State actions
  const handleAddJournalEntry = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
    showToast("Journal entry saved successfully! 📝");
  };

  const handleDeleteJournalEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast("Journal entry removed.");
  };

  const handleAddQMCheckIn = (emoji: string, label: string) => {
    const qmEntry: JournalEntry = {
      id: "entry_" + Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      week: week,
      mood: label,
      emoji: emoji,
      text: "Quick dashboard check-in.",
      symptoms: [],
      quick: true,
    };
    setEntries((prev) => [qmEntry, ...prev]);
    showToast(`Logged mood check-in: ${emoji} ${label}`);
  };

  const handleAddAppointment = (appt: Appointment) => {
    setAppts((prev) => [appt, ...prev]);
    showToast("Appointment added to itinerary! 📅");
  };

  const handleToggleAppointment = (id: string) => {
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    );
    showToast("Visits itinerary updated.");
  };

  const handleDeleteAppointment = (id: string) => {
    setAppts((prev) => prev.filter((a) => a.id !== id));
    showToast("Appointment removed.");
  };

  const handleToggleChecklist = (key: string) => {
    setChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleJumpWeek = () => {
    const input = prompt("Enter current pregnancy week (1 to 40):", week.toString());
    if (input) {
      const parsed = parseInt(input, 10);
      if (parsed >= 1 && parsed <= 40) {
        setWeek(parsed);
        showToast(`Week update: Week ${parsed} 🌸`);
      } else {
        alert("Please enter a valid timeline index between 1 and 40.");
      }
    }
  };

  return (
    <div id="maternal-app-root" className="min-h-screen bg-[#050505] text-[#FFFFFF] relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Animated Atmospheric Orbs in Artistic Flair Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" id="orbs-backdrop">
        <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#FF3E00] opacity-[0.09] blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#FFFFFF] opacity-[0.03] blur-[100px] animate-pulse" style={{ animationDelay: "2.5s" }} />
      </div>

      {/* Styled Top Sticky Branding Nav: Artistic Gallery Theme */}
      <nav id="maternal-nav" className="sticky top-0 z-40 bg-[#050505]/80 border-b border-white/10 backdrop-blur-md px-6 py-4.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-sans font-black uppercase tracking-[0.25em] text-2xl text-white">
            petal<span className="text-[#FF3E00]">.</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 border border-white/10 px-3 py-1 bg-white/5">
            Pregnancy Companion
          </span>
        </div>

        <button
          onClick={handleJumpWeek}
          className="px-5 py-2.5 bg-[#FF3E00]/10 border border-[#FF3E00] text-[#FF3E00] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#FF3E00] hover:text-white transition duration-200 cursor-pointer flex items-center gap-1.5"
          aria-label="Set custom week"
        >
          <span>Week {week}</span>
          <span className="text-[10px] opacity-80">✦</span>
        </button>
      </nav>

      {/* Interactive Sticky Primary Tab switching bar: Flat Border Style */}
      <div id="tabs-bar" className="sticky top-[69px] z-30 bg-[#050505]/95 border-b border-white/10 backdrop-blur-md px-4 py-0 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b-white/10">
        {[
          { id: "home", label: "Home" },
          { id: "results", label: "My Results" },
          { id: "journal", label: "Journal" },
          { id: "diet", label: "Diet" },
          { id: "ask", label: "Ask AI Ally" },
          { id: "checklist", label: "Checklist" },
          { id: "appts", label: "Appointments" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex-shrink-0 px-4.5 py-4 text-[10px] uppercase tracking-[0.2em] font-bold select-none border-b-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-[#FF3E00] text-[#FF3E00]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Container Area */}
      <main className="flex-1 max-w-[680px] w-full mx-auto p-4 sm:p-6 pb-24 z-10 relative overflow-contain flex flex-col justify-start">
        {activeTab === "home" && (
          <Home
            week={week}
            onWeekChange={setWeek}
            vitals={vitals}
            drNotes={drNotes}
            entries={entries}
            onAddHM={handleAddQMCheckIn}
          />
        )}

        {activeTab === "results" && (
          <MyResults
            vitals={vitals}
            onChangeVitals={setVitals}
            drNotes={drNotes}
            onChangeDrNotes={setDrNotes}
            week={week}
          />
        )}

        {activeTab === "journal" && (
          <Journal
            entries={entries}
            onSaveEntry={handleAddJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            week={week}
            vitals={vitals}
            drNotes={drNotes}
          />
        )}

        {activeTab === "diet" && (
          <Diet vitals={vitals} drNotes={drNotes} week={week} />
        )}

        {activeTab === "ask" && (
          <AskAI vitals={vitals} drNotes={drNotes} week={week} />
        )}

        {activeTab === "checklist" && (
          <Checklist checks={checks} onToggleCheck={handleToggleChecklist} />
        )}

        {activeTab === "appts" && (
          <Appointments
            appts={appts}
            onAddAppt={handleAddAppointment}
            onToggleAppt={handleToggleAppointment}
            onDeleteAppt={handleDeleteAppointment}
          />
        )}
      </main>

      {/* Persistent Toast Notifications */}
      {toastMessage && (
        <div
          id="toast-layer"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#FF3E00] text-white text-[10px] font-mono uppercase tracking-widest px-6 py-3.5 shadow-xl flex items-center gap-2 border border-white/20 pointer-events-none"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
