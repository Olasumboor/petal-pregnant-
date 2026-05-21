import React, { useState, useEffect } from "react";
import { JournalEntry, Appointment, VitalsProfile } from "./types";
import Home from "./components/Home";
import MyResults from "./components/MyResults";
import Journal from "./components/Journal";
import Diet from "./components/Diet";
import AskAI from "./components/AskAI";
import Checklist from "./components/Checklist";
import Appointments from "./components/Appointments";
import { Sparkles, Activity, Shield, LogOut, LogIn, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Firebase imports
import { onAuthStateChanged, User, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider, handleFirestoreError, OperationType } from "./firebase";

type ActiveTab = "home" | "results" | "journal" | "diet" | "ask" | "checklist" | "appts";

export default function App() {
  // ─── LOCAL STATE PERSISTENCE FALLBACKS ───
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

  // ─── AUTHENTICATION & SYNC STATES ───
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [syncingCloud, setSyncingCloud] = useState<boolean>(false);
  
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem("petal_offline_name") || "";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const [bypassOffline, setBypassOffline] = useState<boolean>(() => {
    return localStorage.getItem("petal_bypass_offline") === "true";
  });
  const [landingName, setLandingName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Synchronize local states to localStorage
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

  // Monitor Auth State & Perform Two-Way Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncingCloud(true);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.week !== undefined) setWeek(data.week);
            if (data.vitals) setVitals(data.vitals);
            if (data.drNotes !== undefined) setDrNotes(data.drNotes);
            if (data.checks) setChecks(data.checks);
            setDisplayName(data.displayName || currentUser.displayName || "");
          } else {
            // New user, publish local assets to cloud profile
            await setDoc(userRef, {
              week,
              vitals,
              drNotes,
              checks,
              displayName: currentUser.displayName || "",
              updatedAt: serverTimestamp(),
            });
            setDisplayName(currentUser.displayName || "");
          }

          // Fetch / Merge Journal Entries
          const entriesCol = collection(db, "users", currentUser.uid, "entries");
          const entriesSnap = await getDocs(entriesCol);
          if (entriesSnap.empty && entries.length > 0) {
            for (const item of entries) {
              await setDoc(doc(db, "users", currentUser.uid, "entries", item.id), {
                id: item.id,
                date: item.date,
                week: item.week,
                mood: item.mood,
                emoji: item.emoji,
                text: item.text,
                symptoms: item.symptoms || [],
                advice: item.advice || "",
                quick: !!item.quick,
                createdAt: serverTimestamp(),
              });
            }
          } else if (!entriesSnap.empty) {
            const fetchedEntries: JournalEntry[] = [];
            entriesSnap.forEach((doc) => {
              const d = doc.data();
              fetchedEntries.push({
                id: d.id,
                date: d.date,
                week: d.week,
                mood: d.mood,
                emoji: d.emoji,
                text: d.text,
                symptoms: d.symptoms || [],
                advice: d.advice || "",
                quick: !!d.quick,
              });
            });
            setEntries(fetchedEntries.sort((a, b) => b.id.localeCompare(a.id)));
          }

          // Fetch / Merge Appointments
          const apptsCol = collection(db, "users", currentUser.uid, "appointments");
          const apptsSnap = await getDocs(apptsCol);
          if (apptsSnap.empty && appts.length > 0) {
            for (const appt of appts) {
              await setDoc(doc(db, "users", currentUser.uid, "appointments", appt.id), {
                id: appt.id,
                title: appt.title,
                date: appt.date,
                note: appt.note || "",
                done: !!appt.done,
                createdAt: serverTimestamp(),
              });
            }
          } else if (!apptsSnap.empty) {
            const fetchedAppts: Appointment[] = [];
            apptsSnap.forEach((doc) => {
              const d = doc.data();
              fetchedAppts.push({
                id: d.id,
                title: d.title,
                date: d.date,
                note: d.note || "",
                done: !!d.done,
              });
            });
            setAppts(fetchedAppts);
          }

          showToast("Maternal cloud synchronised! ☁️🌸");
        } catch (error) {
          console.error("Cloud Hydration Error: ", error);
          showToast("Could not fully hydrate cloud data.");
        } finally {
          setSyncingCloud(false);
        }
      } else {
        // Safe local default check
        const cachedOfflineName = localStorage.getItem("petal_offline_name") || "";
        setDisplayName(cachedOfflineName);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // ─── AUTHENTICATION CONTROLLER TRIGGERS ───
  const handleGoogleLogin = async () => {
    try {
      setLoadingAuth(true);
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
      showToast("Signed in via Google successfully! 🔑");
    } catch (err: any) {
      console.error("Authentication Error Detail:", err);
      let errMsg = err instanceof Error ? err.message : String(err);
      if (err?.code) {
        errMsg = `Firebase Error: ${err.code} - ${err.message}`;
      }
      setAuthError(errMsg);
      
      const isIframe = window.self !== window.top;
      if (isIframe) {
        showToast("Blocked by iframe sandboxing! Open in a new tab.");
      } else {
        showToast("Google connection declined or failed.");
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoadingAuth(true);
      await signOut(auth);
      // Clean working memory states to separate offline session data
      setWeek(1);
      setVitals({});
      setDrNotes("");
      setEntries([]);
      setAppts([]);
      setChecks({});
      setDisplayName("");
      setBypassOffline(false);
      setAuthError(null);
      localStorage.removeItem("petal_bypass_offline");
      localStorage.removeItem("petal_offline_name");
      showToast("Safely signed out from cloud. 👋");
    } catch (err) {
      console.error(err);
      showToast("Signout failed.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const updateCloudProfile = async (updates: {
    week?: number;
    vitals?: VitalsProfile;
    drNotes?: string;
    checks?: Record<string, boolean>;
    displayName?: string;
  }) => {
    if (!auth.currentUser) return;
    const userPath = `users/${auth.currentUser.uid}`;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        week: updates.week !== undefined ? updates.week : week,
        vitals: updates.vitals !== undefined ? updates.vitals : vitals,
        drNotes: updates.drNotes !== undefined ? updates.drNotes : drNotes,
        checks: updates.checks !== undefined ? updates.checks : checks,
        displayName: updates.displayName !== undefined ? updates.displayName : displayName,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  };

  const handleSaveCustomName = async () => {
    const preparedName = tempName.trim();
    if (!preparedName) return;
    setDisplayName(preparedName);
    setIsEditingName(false);
    localStorage.setItem("petal_offline_name", preparedName);
    showToast(`Persona configured: ${preparedName} 🌸`);
    if (user) {
      await updateCloudProfile({ displayName: preparedName });
    }
  };

  const handleEnterOfflineState = (offlineName: string) => {
    const prepared = offlineName.trim() || "Anonymous Mother";
    setDisplayName(prepared);
    localStorage.setItem("petal_offline_name", prepared);
    setBypassOffline(true);
    localStorage.setItem("petal_bypass_offline", "true");
    showToast(`Welcome! Entering portal as ${prepared} 🌸`);
  };

  // ─── SYNCHRONIZED APP LOGIC MUTATORS ───
  const handleSetWeek = async (newWeek: number) => {
    setWeek(newWeek);
    if (user) {
      await updateCloudProfile({ week: newWeek });
    }
  };

  const handleUpdateVitals = async (newVitals: VitalsProfile) => {
    setVitals(newVitals);
    if (user) {
      await updateCloudProfile({ vitals: newVitals });
    }
  };

  const handleUpdateDrNotes = async (newNotes: string) => {
    setDrNotes(newNotes);
    if (user) {
      await updateCloudProfile({ drNotes: newNotes });
    }
  };

  const handleAddJournalEntry = async (entry: JournalEntry) => {
    if (user) {
      const entryPath = `users/${user.uid}/entries/${entry.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "entries", entry.id), {
          id: entry.id,
          date: entry.date,
          week: entry.week,
          mood: entry.mood,
          emoji: entry.emoji,
          text: entry.text,
          symptoms: entry.symptoms || [],
          advice: entry.advice || "",
          quick: !!entry.quick,
          createdAt: serverTimestamp(),
        });
        showToast("Journal entry synchronized to cloud! 📝");
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, entryPath);
      }
    } else {
      showToast("Journal entry saved locally! 📝");
    }
    setEntries((prev) => [entry, ...prev]);
  };

  const handleDeleteJournalEntry = async (id: string) => {
    if (user) {
      const entryPath = `users/${user.uid}/entries/${id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "entries", id));
        showToast("Entry removed from cloud.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, entryPath);
      }
    } else {
      showToast("Journal entry removed.");
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddQMCheckIn = async (emoji: string, label: string) => {
    const qmEntry: JournalEntry = {
      id: "entry_" + Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      week,
      mood: label,
      emoji,
      text: "Quick dashboard check-in.",
      symptoms: [],
      quick: true,
    };

    if (user) {
      const entryPath = `users/${user.uid}/entries/${qmEntry.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "entries", qmEntry.id), {
          id: qmEntry.id,
          date: qmEntry.date,
          week: qmEntry.week,
          mood: qmEntry.mood,
          emoji: qmEntry.emoji,
          text: qmEntry.text,
          symptoms: qmEntry.symptoms,
          advice: "",
          quick: true,
          createdAt: serverTimestamp(),
        });
        showToast(`Logged mood check-in to cloud: ${emoji} ${label}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, entryPath);
      }
    } else {
      showToast(`Logged mood checked in: ${emoji} ${label}`);
    }
    setEntries((prev) => [qmEntry, ...prev]);
  };

  const handleAddAppointment = async (appt: Appointment) => {
    if (user) {
      const apptPath = `users/${user.uid}/appointments/${appt.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "appointments", appt.id), {
          id: appt.id,
          title: appt.title,
          date: appt.date,
          note: appt.note || "",
          done: !!appt.done,
          createdAt: serverTimestamp(),
        });
        showToast("Appointment synchronized to cloud! 📅");
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, apptPath);
      }
    } else {
      showToast("Appointment added to itinerary! 📅");
    }
    setAppts((prev) => [appt, ...prev]);
  };

  const handleToggleAppointment = async (id: string) => {
    const targetAppt = appts.find((a) => a.id === id);
    if (!targetAppt) return;
    const nextDoneState = !targetAppt.done;

    if (user) {
      const apptPath = `users/${user.uid}/appointments/${id}`;
      try {
        await updateDoc(doc(db, "users", user.uid, "appointments", id), {
          done: nextDoneState,
        });
        showToast("Appointment state synchronized.");
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, apptPath);
      }
    } else {
      showToast("Visits itinerary updated.");
    }
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: nextDoneState } : a))
    );
  };

  const handleDeleteAppointment = async (id: string) => {
    if (user) {
      const apptPath = `users/${user.uid}/appointments/${id}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "appointments", id));
        showToast("Appointment deleted from cloud.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, apptPath);
      }
    } else {
      showToast("Appointment removed.");
    }
    setAppts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleChecklist = async (key: string) => {
    const updatedChecks = {
      ...checks,
      [key]: !checks[key],
    };
    setChecks(updatedChecks);
    if (user) {
      await updateCloudProfile({ checks: updatedChecks });
    }
  };

  const handleJumpWeek = async () => {
    const input = prompt("Enter current pregnancy week (1 to 40):", week.toString());
    if (input) {
      const parsed = parseInt(input, 10);
      if (parsed >= 1 && parsed <= 40) {
        await handleSetWeek(parsed);
        showToast(`Week update: Week ${parsed} 🌸`);
      } else {
        alert("Please enter a valid timeline index between 1 and 40.");
      }
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative overflow-hidden flex flex-col justify-center items-center font-sans">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" id="orbs-backdrop-loading">
          <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#FF3E00] opacity-[0.09] blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#FFFFFF] opacity-[0.03] blur-[100px] animate-pulse" style={{ animationDelay: "2.5s" }} />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <span className="font-sans font-black uppercase tracking-[0.25em] text-4xl text-white">
            petal<span className="text-[#FF3E00]">.</span>
          </span>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[#FF3E00] font-black">
            <span className="w-2 h-2 rounded-full bg-[#FF3E00] animate-ping" />
            <span>CONNECTING PROTOCOLS...</span>
          </div>
        </div>
      </div>
    );
  }

  // Active landing state check
  const showLanding = !user && !bypassOffline;

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FFFFFF] relative overflow-y-auto overflow-x-hidden flex flex-col justify-start font-sans">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" id="orbs-backdrop-landing">
          <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-[#FF3E00] opacity-[0.11] blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] rounded-full bg-[#FFFFFF] opacity-[0.04] blur-[120px] animate-pulse" style={{ animationDelay: "3s" }} />
        </div>

        {/* Global wrapper with constraint */}
        <div className="max-w-[580px] w-full mx-auto px-6 py-16 flex-1 flex flex-col justify-center relative z-10">
          
          {/* Header Branding section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-3.5 mb-11"
          >
            <span className="inline-block text-[10px] uppercase tracking-[0.3em] font-mono text-[#FF3E00] border border-[#FF3E00]/25 px-4 py-1.5 bg-[#FF3E00]/5 mb-1 select-none">
              ✦ CLINICAL PRENATAL LEADERSHIP ✦
            </span>
            <h1 className="font-sans font-black uppercase tracking-[0.2em] text-5xl sm:text-6xl text-white">
              petal<span className="text-[#FF3E00]">.</span>
            </h1>
            <p className="text-xs text-white/50 tracking-wider uppercase font-mono max-w-[420px] mx-auto leading-relaxed">
              Gestational Health Monitor, Traditional West African Nutrition Guides, & Clinical AI Ally
            </p>
          </motion.div>

          {/* Grid of details/capabilities */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1.0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-9"
          >
            {[
              { title: "🩺 STIMULATED METRICS", desc: "Monitor daily gestational temperature, blood pressure, weight, and blood glucose index trackers." },
              { title: "🇳🇬 NIGERIAN DIETETICS", desc: "In-depth nutritional profiles of safe, premium, high-vitality West African meals calibrated for hemoglobin levels and glycemic control." },
              { title: "🧠 CLINICAL AI ADVISOR", desc: "Engage in intelligent prenatal counseling powered by Gemini specialized in West African maternal diets." },
              { title: "📋 PREMED COMPANION", desc: "Integrated smart checklists, clinical appointments schedule log, and real-time pregnancy journal log." },
            ].map((feat, idx) => (
              <div key={idx} className="bg-white/[0.02] border border-white/10 p-4.5 rounded-none glass border-l-2 border-l-[#FF3E00]/50 hover:border-l-[#FF3E00] transition duration-200">
                <h3 className="font-mono text-[10px] font-extrabold text-white uppercase tracking-wider mb-1 mr-1">{feat.title}</h3>
                <p className="text-[11px] text-white/55 leading-relaxed font-light">{feat.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Action form module */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-none relative glass space-y-6"
          >
            {/* Primary Action Button: Auth */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00]" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00] font-black">RECOMMENDED / SECURE SYNC</span>
                </div>
                {isInIframe && (
                  <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 font-mono tracking-wider font-bold">
                    [ IFRAME DETECTED ]
                  </span>
                )}
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-[#FF3E00]/10 hover:bg-[#FF3E00] border border-[#FF3E00] text-[#FF3E00] hover:text-white font-mono text-xs uppercase tracking-widest font-black transition duration-200 cursor-pointer flex items-center justify-center gap-2.5 shadow-md shadow-[#FF3E00]/5 hover:shadow-lg hover:shadow-[#FF3E00]/20 active:scale-[0.985]"
              >
                <LogIn className="w-4 h-4" /> SECURE GMAIL CLOUD SYNC & LOGIN
              </button>

              {/* Iframe Hint Banner */}
              {isInIframe && (
                <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 space-y-1.5 text-[11px] leading-relaxed text-amber-300 font-mono">
                  <span className="font-extrabold text-amber-400 block tracking-wider uppercase text-[10px]">
                    ⚠️ BROWSER SANDBOX LIMITATION
                  </span>
                  <p className="text-[10px] text-amber-200/85">
                    Google Sign-In popups are blocked inside standard embedded frames. To authenticate through your secure Gmail cloud, click the <strong className="text-white font-sans font-bold">"Open in a new tab"</strong> button at the top-right of the AI Studio preview bar, or use the offline sandbox below!
                  </p>
                </div>
              )}

              {/* Detailed Error Diagnostics Box */}
              {authError && (
                <div className="bg-red-500/10 border border-red-500/25 p-3.5 space-y-2 text-[11px] leading-relaxed text-red-300 font-mono">
                  <span className="font-bold text-red-400 block tracking-wider uppercase text-[10px]">
                    🔴 DIAGNOSTIC LOG REPORT
                  </span>
                  <p className="text-[10px] text-red-200/85 break-words">
                    {authError}
                  </p>
                  <p className="text-[10px] text-white/50 border-t border-white/10 pt-1.5">
                    If this is an "auth/unauthorized-domain" mismatch, please go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#FF3E00] underline hover:text-white">Firebase Console</a> → Auth → Settings → <strong>Authorized Domains</strong> and add both:
                    <br />
                    <span className="text-white select-all block mt-1 bg-white/5 p-1 rounded font-mono text-[10px]">
                      {window.location.hostname}
                    </span>
                  </p>
                </div>
              )}

              <p className="text-[10px] text-white/40 leading-relaxed font-light text-center">
                Syncs metrics, journal diaries, and scheduled doctor checks inside Google Firestore database securely.
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <span className="absolute left-0 right-0 h-[1px] bg-white/10" />
              <span className="relative z-10 px-4 bg-[#050505] text-[9px] text-white/40 font-mono uppercase tracking-widest select-none">
                OR EXPLORE SANDBOX
              </span>
            </div>

            {/* Secondary Action: Offline bypass */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block font-bold">
                  Maternal Persona / Your Name
                </label>
                <input
                  type="text"
                  value={landingName}
                  onChange={(e) => setLandingName(e.target.value)}
                  placeholder="e.g. Mama Amadi"
                  className="w-full bg-white/5 border border-white/15 focus:border-[#FF3E00]/60 text-white placeholder-white/35 font-mono text-sm px-4.5 py-3 rounded-none outline-none transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEnterOfflineState(landingName);
                  }}
                  maxLength={24}
                />
              </div>

              <button
                onClick={() => handleEnterOfflineState(landingName)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-mono text-xs uppercase tracking-widest transition duration-200 cursor-pointer active:scale-[0.985]"
              >
                PROCEED OFF-GRID
              </button>

              <p className="text-[10px] text-white/40 leading-relaxed font-light text-center">
                Runs locally on this dev client. Progress is archived directly inside local storage indices.
              </p>
            </div>
          </motion.div>

          {/* Footer credentials */}
          <div className="mt-10 text-center text-[10px] text-white/30 font-mono tracking-widest select-none uppercase">
            [ CLINIC STATUS: SECURE & ENCRYPTED ]
          </div>
        </div>

        {/* Global Toast display within landing container as fallback */}
        {toastMessage && (
          <div
            id="toast-layer-landing"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#FF3E00] text-white text-[10px] font-mono uppercase tracking-widest px-6 py-3.5 shadow-xl flex items-center gap-2 border border-white/20 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

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

      {/* ─── CLOUD SYNC & AUTH STATUS BAR ─── */}
      <div className="max-w-[680px] w-full mx-auto px-4 sm:px-6 pt-5 shrink-0 z-20">
        <div className="bg-white/[0.03] border border-white/10 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative glass">
          <div className="flex gap-3 items-center">
            {user ? (
              <>
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-none border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF3E00] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E00] animate-pulse" /> CLOUD SECURE
                    </span>
                    <span className="text-[9px] text-white/40 font-mono">({user.email})</span>
                  </div>
                  
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-white/10 border border-white/10 text-[11px] text-white px-2 py-0.5 rounded-none outline-none focus:border-[#FF3E00] font-mono leading-none h-6"
                        placeholder="Maternal persona..."
                        maxLength={24}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveCustomName();
                        }}
                      />
                      <button
                        onClick={handleSaveCustomName}
                        className="text-[#FF3E00] hover:text-white p-1 transition cursor-pointer"
                        title="Save name"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 select-none">
                      <p className="text-xs text-white/80 font-light">
                        Maternal Profile: <span className="font-extrabold uppercase tracking-wider text-white">{displayName || "Configure Name"}</span>
                      </p>
                      <button
                        onClick={() => {
                          setTempName(displayName);
                          setIsEditingName(true);
                        }}
                        className="text-white/40 hover:text-[#FF3E00] transition cursor-pointer p-0.5"
                        title="Enter maternal name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-bold">
                    [ OFFLINE MEMORY COOP ]
                  </span>
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-white/10 border border-white/10 text-[11px] px-2 py-0.5 rounded-none outline-none focus:border-[#FF3E00] font-mono text-white leading-none h-6"
                        placeholder="Maternal name..."
                        maxLength={24}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveCustomName();
                        }}
                      />
                      <button
                        onClick={handleSaveCustomName}
                        className="text-[#FF3E00] p-1 cursor-pointer hover:text-white transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-white/50">
                        Persona: <span className="text-white uppercase font-bold tracking-wider">{displayName || "Anonymous Mother"}</span>
                      </p>
                      <button
                        onClick={() => {
                          setTempName(displayName);
                          setIsEditingName(true);
                        }}
                        className="text-white/40 hover:text-[#FF3E00] transition cursor-pointer p-0.5"
                        title="Set maternal name"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/10 pt-2.5 sm:pt-0">
            {user ? (
              <button
                onClick={handleLogout}
                disabled={loadingAuth}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 hover:text-white font-mono text-[9px] uppercase tracking-widest transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
              >
                <LogOut className="w-3.5 h-3.5" /> SIGN OUT
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={loadingAuth}
                className="px-4 py-1.5 bg-[#FF3E00]/10 hover:bg-[#FF3E00] border border-[#FF3E00] text-[#FF3E00] hover:text-white font-mono text-[9px] uppercase tracking-widest font-black transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
              >
                <LogIn className="w-3.5 h-3.5" /> INITIALIZE GMAIL CLOUD LOG IN
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Container Area */}
      <main className="flex-1 max-w-[680px] w-full mx-auto p-4 sm:p-6 pb-24 z-10 relative overflow-contain flex flex-col justify-start">
        {activeTab === "home" && (
          <Home
            displayName={displayName}
            week={week}
            onWeekChange={handleSetWeek}
            vitals={vitals}
            drNotes={drNotes}
            entries={entries}
            onAddHM={handleAddQMCheckIn}
          />
        )}

        {activeTab === "results" && (
          <MyResults
            vitals={vitals}
            onChangeVitals={handleUpdateVitals}
            drNotes={drNotes}
            onChangeDrNotes={handleUpdateDrNotes}
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
