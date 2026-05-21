import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 1. Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, week, vitals, drNotes } = req.body;
    const ai = getAiClient();
    
    if (!ai) {
      return res.json({ 
        text: "🌸 **Offline Mode active.** To enable full, smart conversational advice from Petal, please set your `GEMINI_API_KEY` in the **Settings > Secrets** panel in the top-right! Till then, enjoy your local journal and stats logging." 
      });
    }

    const vitalsStr = Object.entries(vitals || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "none entered yet";

    const systemInstruction = `You are Petal, a warm, professional, comforting, and deeply knowledgeable pregnancy companion AI. 
The user is currently at Week ${week || 1} of their pregnancy. 
Their self-entered health profile is:
- Lab Vitals: ${vitalsStr}
- Doctor's Notes: ${drNotes || "none provided"}

Adhere to the following rules:
1. Provide a warm, reassuring, evidence-based, compassionate response.
2. Keep it compact, practical, and split into 2-3 short, highly readable paragraphs. Use Markdown if formatting.
3. Avoid dense mechanical talk or listicles when a flowing narrative is warmer.
4. If they mention danger signs (heavy bleeding, sudden severe localized pain, preeclampsia warning signs like severe visual changes or extreme hand/eye swelling), calmly and directly advise them to seek emergency medical attention or contact their midwife/OB-GYN.
5. End our interactions with a light clinical reminder to speak with their personal physician for finalized medical choices.`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "ai" || h.role === "model" ? "model" : "user",
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I couldn't process that. Please ask again!" });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Petal AI." });
  }
});

// 2. Journal analysis endpoint
app.post("/api/analyze-journal", async (req, res) => {
  try {
    const { mood, symptoms, text, week, vitals, drNotes } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        text: "🌸 **Gemini API Key missing.** To get automated diagnostic interpretations of your symptoms and journal entries, enter your `GEMINI_API_KEY` under Secrets. Rest assured, your entries remain securely saved locally!"
      });
    }

    const vitalsStr = Object.entries(vitals || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "none entered yet";

    const prompt = `System guidance: You are Petal, a warm prenatal nursing coach. 
Analyze the mother's current state and offer comfort, guidance, and medical context.

CURRENT JOURNAL ENTRY DETAILS:
- Pregnancy Week: ${week || 1}
- Mood Check-in: ${mood || "Not recorded"}
- Physical Symptoms reported: ${Array.isArray(symptoms) ? symptoms.join(", ") : "None indicated"}
- Journal Notes: "${text || "No journal notes written"}"

HEALTH BACKGROUND:
- Lab Vitals: ${vitalsStr}
- Obstetrician Notes: ${drNotes || "none provided"}

Please craft a beautiful 2-3 paragraph response without bullets:
1. Validate her feelings and symptoms. Explain any baby development progress at Week ${week} to connect with her feelings or bodily symptoms (e.g., surge in hormone levels, baby growing limbs).
2. Offer 3 actionable, comforting maternal remedies for self care, hydration, or light activity today.
3. State whether her symptoms seem fully typical for this trimester, and offer a small supportive tip for her partner/support partner on how to pamper her today. Keep the vocabulary cozy and gentle.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { temperature: 0.7 }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Journal analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Lab values/vitals analysis endpoint
app.post("/api/analyze-results", async (req, res) => {
  try {
    const { vitals, drNotes, week, bmi } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        text: "🌸 **Gemini API Key missing.** Petal analyzes your clinical bio-markers to customized advice. Input a `GEMINI_API_KEY` under Secrets to unlock our clinical health analyzer."
      });
    }

    const vitalsStr = Object.entries(vitals || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "none entered yet";

    const prompt = `System guidance: You are Petal, a compassionate maternal health specialist.
Help the mother interpret her medical metrics in plain English.

HER RESULTS PROFILE AT WEEK ${week || 1}:
- Vitals & Labs entered by user: ${vitalsStr}
- Calculated Maternal BMI: ${bmi || "unknown"}
- OB doctor notes: ${drNotes || "none entered yet"}

Please formulate an elegant, comforting assessment of 3 paragraphs:
1. A warm summary of her current entries.
2. In simple, reassuring terms state what any low readings (like Hemoglobin highlighting typical dilutional anemia) or high values (like fasting blood sugar / glucose trends) mean during pregnancy. Give natural, simple wellness contexts rather than scaring the mother.
3. Outline 3 tailored dietary/lifestyle shifts to boost metrics together with 2 smart questions she can note down to ask her physician during the next visit. Mention she should always verify health decisions with her caregiver.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { temperature: 0.6 }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Results analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Personalized Diet AI Advisor
app.post("/api/ask-diet", async (req, res) => {
  try {
    const { question, vitals, bmi, drNotes, week } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        text: "🌸 **Gemini API Key missing.** Enter your key in Settings > Secrets to unlock customized diet recipes. Petal can automatically recommend dishes targeted to your exact biomarker needs (like iron-boosting meals or glycemic-balanced portions)!"
      });
    }

    const vitalsStr = Object.entries(vitals || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ") || "none entered yet";

    const prompt = `System guidance: You are Petal's Maternal Nutritionist AI.
Help the mother design nourishing, pregnancy-safe meals and snacks.

DIET QUERY: "${question}"

HEALTH PROFILE DETAILS:
- Week: ${week || 1}
- Medical Vitals: ${vitalsStr}
- BMI: ${bmi || "unknown"}
- OB advice: "${drNotes || "none"}"

Provide a warm, inspiring 3-paragraph answer:
1. Direct solutions for her symptom/question (e.g. food options for intense morning nausea, optimal foods for iron absorption, low-GI snacks for glucose balance).
2. Recommend 4 specific, nutritious, delicious ingredients or local meals that are highly safe, appetizing, and targeted to her health metrics.
3. Keep the advice deeply positive, encouraging, and centered on nourishing both her body and the growing child.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { temperature: 0.7 }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Diet AI error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Integrate Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
