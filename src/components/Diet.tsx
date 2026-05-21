import React, { useState } from "react";
import { motion } from "motion/react";
import { VitalsProfile } from "../types";
import { Carrot, Sparkles, AlertCircle, RefreshCw, Apple, Heart } from "lucide-react";

interface DietProps {
  vitals: VitalsProfile;
  drNotes: string;
  week: number;
}

export default function Diet({ vitals, drNotes, week }: DietProps) {
  const [activeSubTab, setActiveSubTab] = useState<"essentials" | "iron" | "glycemic" | "mealplan" | "customai" | "nigerian">("essentials");
  const [askQuery, setAskQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState("");

  const handleAskDietAI = async (customQ?: string) => {
    const queryToUse = customQ || askQuery;
    if (!queryToUse.trim()) {
      alert("Please select or type a nutrition query first!");
      return;
    }
    setLoading(true);
    setAiRecipe("");
    try {
      const w = parseFloat(vitals.wt || "");
      const h = parseFloat(vitals.ht || "");
      const bmiVal = !isNaN(w) && !isNaN(h) && h > 0 ? ((w / (h * h)) * 703).toFixed(1) : undefined;

      const response = await fetch("/api/ask-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: queryToUse,
          vitals,
          drNotes,
          week,
          bmi: bmiVal,
        }),
      });
      const data = await response.json();
      if (data.text) {
        setAiRecipe(data.text);
      } else {
        setAiRecipe("Unable to synthesize dietary specifications at this moment.");
      }
    } catch (e) {
      setAiRecipe("Network glitch. Failed to consult the diet server.");
    } finally {
      setLoading(false);
    }
  };

  const runPresetQuery = (q: string) => {
    setAskQuery(q);
    handleAskDietAI(q);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-sans font-black uppercase tracking-[0.2em] text-white">Diet & Maternal Nutrition</h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#FF3E00]">
          [ CUSTOM NUTRITIONAL FLUID MATRIX DESIGNS TO STABILIZE GESTATIONAL MARKERS ]
        </p>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/10 flex-wrap">
        {[
          { id: "essentials", label: "⭐ ESSENTIALS" },
          { id: "iron", label: "🩸 IRON-BOOST" },
          { id: "glycemic", label: "⚖️ BLOOD SUGAR" },
          { id: "nigerian", label: "🇳🇬 NIGERIAN MEALS" },
          { id: "mealplan", label: "📋 MEAL SCHEDULER" },
          { id: "customai", label: "✨ DIET CUSTOMIZER AI" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4.5 py-2.5 rounded-none text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-[#FF3E00] text-white border border-[#FF3E00]"
                : "bg-white/5 hover:bg-white/10 text-white/55 border border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER ESSENTIALS */}
      {activeSubTab === "essentials" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white/5 border border-[#FF3E00]/20 rounded-none p-6 border-t-4 border-t-[#FF3E00]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Carrot className="w-4 h-4 text-[#FF3E00]" /> [ BIOLOGICAL NUTRIENT BUILDING BLOCKS ]
            </h3>
            <p className="text-xs text-white/50 mt-1.5 leading-snug font-light">
              Fundamental micronutrients to support neuro-tubular development and skeletal density.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: "🥬", name: "Leafy Greens (spinach, pumpkin ugu)", desc: "Immensely rich in natural folate, dietary iron, and potassium. Direct nervous alignment helper.", badge: "Folate-Rich", color: "bg-[#FF3E00]/10 border border-[#FF3E00]/20 text-[#FF3E00]" },
              { emoji: "🥚", name: "Farm Pasture Eggs", desc: "Gold standard amino acid supply. Delivers high concentrations of neural wiring agent Choline.", badge: "Choline & Protein", color: "bg-white/10 border border-white/20 text-white" },
              { emoji: "🐟", name: "Low-Mercury Salmon & Cod", desc: "Saturated with critical Omega-3 DHA compound. Stimulates retina and cognitive tissue construction.", badge: "Omega 3 DHA", color: "bg-[#FF3E00]/10 border border-[#FF3E00]/20 text-[#FF3E00]" },
              { emoji: "🥛", name: "Bio-Fermented Dairy & Plant Milk", desc: "Delivers digestible liquid calcium and Vitamin D to anchor maternal skeleton density.", badge: "Calcium Build", color: "bg-white/10 border border-white/20 text-white" },
              { emoji: "🍊", name: "Citrus Fruits & Berries", desc: "Rich in Vitamin C. Consuming acid assets immediately duplicates non-heme iron absorption speeds.", badge: "Vitamin C Booster", color: "bg-[#FF3E00]/10 border border-[#FF3E00]/20 text-[#FF3E00]" },
              { emoji: "🫘", name: "Legumes, Grains, and Lentils", desc: "Complex carbs loaded with digestive soluble fiber to fully streamline maternal gut peristalsis.", badge: "B-Vitamins & Fiber", color: "bg-white/10 border border-white/20 text-white" },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 p-4.5 rounded-none border border-white/10 flex gap-4 transition duration-150 hover:border-white/20">
                <span className="text-3xl shrink-0" role="img" aria-label={f.name}>{f.emoji}</span>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider leading-tight">{f.name}</h4>
                  <p className="text-xs text-white/70 leading-relaxed font-light">{f.desc}</p>
                  <span className={`inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-none ${f.color}`}>{f.badge}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FF3E00]/5 border border-[#FF3E00]/20 rounded-none p-5 space-y-2.5">
            <h4 className="font-mono text-xs font-bold text-[#FF3E00] uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 animate-pulse" /> CRUCIAL GESTATIONAL MATERNAL CONTRAINDICATIONS
            </h4>
            <p className="font-mono text-[9px] text-[#FF3E00] uppercase tracking-wider leading-relaxed">
              ❌ RAW / UNCOOKED SEAFOOD OR EGGS (SALMONELLA RISKS) • ❌ UNPASTEURIZED CHEESES (LISTERIA TOXINS) • ❌ HIGH-MERCURY FISH SPECIES (SWORDFISH, SHARK) • ❌ COLD PROCESSED MEATS UNLESS DEEPLY COOKED • ❌ ALCOHOL ENTIRELY • ❌ STRICT CAFFEINE CEILING UNDER 200MG DAILY.
            </p>
          </div>
        </motion.div>
      )}

      {/* RENDER IRON FOCUS */}
      {activeSubTab === "iron" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white/5 border border-[#FF3E00]/20 rounded-none p-6 border-t-4 border-t-[#FF3E00] space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-white/55 uppercase tracking-widest">[ HEMOGLOBIN BOOST PATTERN ]</span>
            <h3 className="text-sm font-mono uppercase tracking-widest font-black text-white">Oxygen & Red Cells Enhancement</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Accelerate iron absorption. If parameters represent hemoglobin counts limits below 10.5 g/dL, elevate daily intake of iron catalysts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: "🥩", name: "Lean Grass-Fed Beef & Meat", info: "Supplies premium Heme Iron. It is processed in the gut up to three times better than plant-derived alternatives.", b: "HEME BIO-ACTIVE" },
              { emoji: "🌿", name: "Green Pumpkin Leaves (Ugu)", info: "The crown jewel of plant iron and folate. Add heavily to soups, steamed dishes, or light broths.", b: "SUPERPLANT ANCHOR" },
              { emoji: "🫘", name: "Black-Eyed Peas & Moin-moin", info: "Fabulous vegan nutrient combo. Easy on the stomach, providing a safe, clean stream of minerals and folate.", b: "DIETARY FOLATE" },
              { emoji: "🍗", name: "Organic Cooled Poultry Fillets", info: "High mineral counts that aid hemoglobin structure. Keep fully baked and cooked.", b: "SUPPORTING CARRIER" },
            ].map((f, idx) => (
              <div key={idx} className="bg-white/5 p-4.5 rounded-none border border-white/10 flex gap-4">
                <span className="text-3xl shrink-0" role="img" aria-label={f.name}>{f.emoji}</span>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider leading-tight">{f.name}</h4>
                  <p className="text-xs text-white/70 leading-snug font-light">{f.info}</p>
                  <span className="inline-block text-[9px] font-mono font-bold bg-[#FF3E00]/15 text-[#FF3E00] border border-[#FF3E00]/25 px-2 py-0.5 rounded-none uppercase tracking-widest">{f.b}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-none bg-white/5 border border-white/10 text-xs text-white/80 space-y-1.5 leading-relaxed border-l-4 border-l-[#FF3E00]">
            <p className="font-mono text-xs font-bold text-[#FF3E00] uppercase tracking-widest flex items-center gap-1.5">
              💡 IRON BIO-ABSORPTION COEFFICIENT GUIDE:
            </p>
            <p className="text-white/70 font-light">
              Always pair non-heme (plant) iron items with fruit juice or citrus acids. Please completely avoid ingesting dairy calcium, black teas, or filtered coffees during or within 1.5 hours of iron-centric dishes.
            </p>
          </div>
        </motion.div>
      )}

      {/* RENDER GLYCEMIC BALANCE */}
      {activeSubTab === "glycemic" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white/5 border border-[#FF3E00]/20 rounded-none p-6 border-t-4 border-t-[#FF3E00] space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-white/55 uppercase tracking-widest">[ GLYCO-KINETIC STABILITY PROTOCOL ]</span>
            <h3 className="text-sm font-mono uppercase tracking-widest font-black text-white">Blood Sugar Regulation</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Maintain uniform pancreatic load and flat insulin reactions. Utilize low-glycemic complexes and space calories incrementally throughout the maternal daily cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: "🍠", name: "Baked Yam & Sweet Potatoes", desc: "Possesses a much lower glycemic impact than white russet potatoes. Loaded in vital Vitamin A.", badge: "SLOW BURNING CONJUGATES" },
              { emoji: "🌰", name: "Raw Walnut, Almond, & Groundnut Mix", desc: "Packed with clean fats and amino-protein. Zero blood-glucose impact. Ideal for late-afternoon snack cravings.", badge: "AMINO ENZYME FUEL" },
              { emoji: "🥦", name: "High-Density Broccoli & Asparagus", desc: "Loaded in insoluble dietary fiber. Directly buffers carb digestion, keeping blood glucose levels flat.", badge: "INSULIN-SAFE SOLUTES" },
              { emoji: "🥣", name: "Unsweetened Steel-Cut Oat Bran porridge", desc: "Replaces processed boxed cereals. Contains beta-glucan fibers which stabilize post-meal glucose spikes.", badge: "BETA GLUCAN CONTEXT" },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 p-4.5 rounded-none border border-white/10 flex gap-4">
                <span className="text-3xl shrink-0" role="img" aria-label={f.name}>{f.emoji}</span>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider leading-tight">{f.name}</h4>
                  <p className="text-xs text-white/70 leading-snug font-light">{f.desc}</p>
                  <span className="inline-block text-[9px] font-mono bg-[#FF3E00]/15 text-[#FF3E00] border border-[#FF3E00]/25 px-2 py-0.5 rounded-none uppercase tracking-widest">{f.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* RENDER MEAL PLAN */}
      {activeSubTab === "mealplan" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-white/5 p-6 rounded-none border border-white/10 space-y-1 border-l-4 border-l-[#FF3E00]">
            <h3 className="font-mono text-xs font-bold uppercase text-white tracking-[0.15em]">[ PRENATAL MEAL SEQUENCE DESIGN ]</h3>
            <p className="text-xs text-white/60 font-light">Calculated to prevent gastric distress, morning sickness, and insulin peaks.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4.5 text-xs">
            {/* Monday */}
            <div className="bg-white/5 p-5 rounded-none border border-white/10 space-y-3 relative border-t-2 border-t-[#FF3E00]">
              <span className="font-mono font-bold text-[#FF3E00] block uppercase tracking-widest text-[9px]">[ MONDAY SEQUENCES ]</span>
              <ul className="space-y-2.5 font-light text-white/80">
                <li>🌅 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Breakfast:</strong> Oats with raw berries, 2 cooked eggs, tea.</li>
                <li>🍎 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Mid-Snack:</strong> Handful of almonds.</li>
                <li>☀️ <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Lunch:</strong> Spinach & cod fillet salad with lemon squeeze.</li>
                <li>🌙 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Dinner:</strong> Grilled salmon, sweet potato mash, greens.</li>
              </ul>
            </div>

            {/* Tuesday */}
            <div className="bg-white/5 p-5 rounded-none border border-white/10 space-y-3 relative border-t-2 border-t-[#FF3E00]">
              <span className="font-mono font-bold text-[#FF3E00] block uppercase tracking-widest text-[9px]">[ TUESDAY SEQUENCES ]</span>
              <ul className="space-y-2.5 font-light text-white/80">
                <li>🌅 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Breakfast:</strong> Toast, 1 boiled egg, fresh citrus slices.</li>
                <li>🍎 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Mid-Snack:</strong> Plain unsweetened yogurt.</li>
                <li>☀️ <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Lunch:</strong> Lentil pumpkin soup, brown rice grains.</li>
                <li>🌙 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Dinner:</strong> Chicken breast baked with broccoli spears.</li>
              </ul>
            </div>

            {/* Wednesday */}
            <div className="bg-white/5 p-5 rounded-none border border-white/10 space-y-3 relative border-t-2 border-t-[#FF3E00]">
              <span className="font-mono font-bold text-[#FF3E00] block uppercase tracking-widest text-[9px]">[ WEDNESDAY SEQUENCES ]</span>
              <ul className="space-y-2.5 font-light text-white/80">
                <li>🌅 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Breakfast:</strong> Green folate shake (spinach, peanuts, milk).</li>
                <li>🍎 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Mid-Snack:</strong> Crisp pear halves with walnuts.</li>
                <li>☀️ <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Lunch:</strong> Boiled fish fillets, ugu salad, whole bread.</li>
                <li>🌙 <strong className="text-white font-mono uppercase text-[9px] tracking-wider block">Dinner:</strong> Lean beef slices wok-tossed with peppers.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* RENDER NIGERIAN MEALS */}
      {activeSubTab === "nigerian" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white/5 border border-[#FF3E00]/20 rounded-none p-6 border-t-4 border-t-[#FF3E00] space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-white/55 uppercase tracking-widest">[ NIGERIAN PRENATAL MEAL PREPARATIONS ]</span>
            <h3 className="text-sm font-mono uppercase tracking-widest font-black text-white">Traditional West African Nutrition</h3>
            <p className="text-xs text-white/60 leading-relaxed font-light">
              Nourishing, pregnancy-safe recipe blocks using traditional ingredients calibrated to boost hemoglobin levels, secure gut biome health, and control maternal glycemic response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                emoji: "🫘",
                name: "Steamed Bean Pudding (Moin-Moin)",
                target: "FOLATE & PROTEIN MASS",
                desc: "High protein, rich in natural dietary fiber and folic acid. Helps stabilize blood sugar and counters morning nausea.",
                prep: "Peel brown/black-eyed beans, blend with tatashe (bell pepper), onions, and fresh ginger. Gently fold in a touch of healthy vegetable oil or flaked smoked fish. Scoop into traditional Ewe leaves or ramekins, and steam slowly in 2 inches of boiling water for 45-50 minutes until set."
              },
              {
                emoji: "🍲",
                name: "Ugu & Scent Leaf Chicken Stew",
                target: "OXYGEN COMPOSITION",
                desc: "Maximizes maternal iron (hemoglobin) and folic acid stores. Great for energy recovery and boosting appetite.",
                prep: "Slowly simmer diced chicken breast in a broth seasoned with onions, garlic, and fresh scent leaves (efirin, which relaxes the stomach). 3 minutes before heat removal, fold in abundant thoroughly-washed shredded green Pumpkin leaves (Ugu) to retain optimal micronutrients."
              },
              {
                emoji: "🍠",
                name: "Unripe Plantain & Smoked Catfish Porridge",
                target: "GLYCEMIC BALANCE & BLOOD PRESSURE",
                desc: "Low-glycemic alternative supplying starch-resistant carbohydrates, highly rich in Potassium to alleviate leg cramps.",
                prep: "Peel and slice green unripe plantains. Cook in a base broth with a light drop of palm oil, ground crayfish, onions, and pre-soaked smoked catfish. Allow to bubble on medium heat until the plantain chunks are tender, then stir in washed leafy green spinach."
              },
              {
                emoji: "🥣",
                name: "Fermented Guinea Corn Ogi (Brown Pap)",
                target: "PREBIOTIC SOOTHE & NAUSEA RELIEF",
                desc: "Gentle fermented pap. Easy on the stomach during extreme first-trimester morning sickness; promotes gut flora.",
                prep: "Dissolve 3 tablespoons of raw fermented brown guinea corn (baba ogi) paste in a cup of cool water. Pour slowly into a pot of boiling water while stirring constantly on low heat until thickness is achieved. Serve warm topped with organic soy milk powder."
              }
            ].map((recipe, idx) => (
              <div key={idx} className="bg-white/5 p-5 rounded-none border border-white/10 flex flex-col gap-3 relative border-l-2 border-l-[#FF3E00] glass">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={recipe.name}>{recipe.emoji}</span>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{recipe.name}</h4>
                    <span className="text-[8px] font-mono font-bold text-[#FF3E00] tracking-widest">{recipe.target}</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-white/60 font-medium">{recipe.desc}</p>
                  <p className="text-white/80 font-light border-t border-white/10 pt-2 leading-relaxed">
                    <strong className="text-white font-mono text-[9px] uppercase tracking-wider block mb-1">👩‍🍳 PREPARATION GUIDE:</strong>
                    {recipe.prep}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-none p-5 text-xs text-white/50 leading-relaxed font-mono text-[9px] space-y-1 glass border-l-4 border-l-[#FF3E00]">
            <span className="text-white block font-bold uppercase tracking-widest">[ NATIONWIDE NIGERIAN GESTATIONAL COMPOSITION INSIGHT ]</span>
            <p className="font-light">
              West African traditional ingredients are packed with prebiotics and microelements. Prioritize sourcing dry crayfish, scent leaves, and ugu natively to keep dishes rich in bio-available iron and completely free from artificial flavor cubes which are loaded with standard chemical sodium.
            </p>
          </div>
        </motion.div>
      )}

      {/* RENDER CUSTOM AI */}
      {activeSubTab === "customai" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white/5 rounded-none p-6 border border-white/10 space-y-4">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <span className="font-mono text-[9px] font-bold text-white/50 uppercase tracking-widest">[ NUTRITIONAL EXPERT AI PROTEM COOP ]</span>
              <h3 className="font-mono font-bold uppercase text-xs text-[#FF3E00] tracking-widest">Gestational Recipe Design & Advice</h3>
            </div>

            <div className="space-y-3">
              <textarea
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#FF3E00] focus:bg-white/10 outline-none rounded-none text-xs h-20 resize-y text-white leading-relaxed placeholder:text-white/20 select-text"
                placeholder="Type dynamic nutritional queries e.g. What snacks help buffer nausea in week 12? Or how can I optimize iron levels on vegan diets?"
              />

              {/* Preset suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Nigerian meal prep for iron & hemoglobin",
                  "Low-glycemic Nigerian dishes for blood sugar",
                  "Pregnancy-safe Moin-Moin meal preparation",
                  "First Trimester morning sickness relief with Ginger Ogi",
                  "Nutritional value of green Ugu soup during pregnancy",
                  "Nutrition guide for sudden sweet cravings",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => runPresetQuery(q)}
                    className="text-[9px] font-mono bg-white/5 border border-white/10 text-white/60 hover:border-[#FF3E00] hover:text-[#FF3E00] rounded-none px-3 py-1.5 transition whitespace-nowrap cursor-pointer uppercase tracking-wider"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleAskDietAI()}
                disabled={loading}
                className="px-6 py-2.5 rounded-none bg-[#FF3E00] hover:bg-white hover:text-black border border-[#FF3E00] text-white font-mono uppercase tracking-widest text-xs font-bold h-11 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    FORMULATING FORMULA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    GENERATE ADVICE SHREDS
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response window */}
          {(aiRecipe || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-none bg-white/[0.02] border border-white/10 space-y-3.5 relative border-l-4 border-l-[#FF3E00]"
            >
              <div className="flex items-center gap-1.5 text-[#FF3E00]">
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-[0.2em]">[ MEAL AND RECIPE DISCOVERY SHEET ]</h4>
              </div>

              {loading ? (
                <div className="space-y-2 animate-pulse py-1">
                  <div className="h-3 bg-white/10 rounded-none w-11/12" />
                  <div className="h-3 bg-white/10 rounded-none w-4/5" />
                  <div className="h-3 bg-white/10 rounded-none w-5/6" />
                </div>
              ) : (
                <div className="text-white/80 space-y-3 text-xs leading-relaxed whitespace-pre-line font-light pr-4">
                  {aiRecipe}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
