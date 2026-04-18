import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create and export the Express app instance
export const app = express();

app.use(express.json());

// Initialize Gemini AI on the server Side
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Secure AI Proxy Route
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { model: modelName, prompt, config, schema } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const generationConfig: any = { ...config };
    if (schema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = schema;
    }

    const result = await genAI.models.generateContent({
      model: modelName || "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: generationConfig
    });

    res.json({ text: result.text });
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// TTS Proxy Route
app.post("/api/ai/tts", async (req, res) => {
  try {
     const { text } = req.body;
     const result = await genAI.models.generateContent({ 
       model: "gemini-3.1-flash-tts-preview",
       contents: [{ parts: [{ text: text.slice(0, 1000) }] }],
       config: {
         responseModalities: [Modality.AUDIO],
         speechConfig: {
           voiceConfig: {
             prebuiltVoiceConfig: {
               voiceName: 'Kore' 
             },
           },
         },
       },
     });

     res.json({ data: result.text });
  } catch (error: any) {
    console.error("TTS Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const PORT = 3000;

  // Vite Middleware integration
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Standard production environment (not Vercel)
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening if run directly (not as a serverless function)
  if (!process.env.VERCEL && (process.env.NODE_ENV !== "production" || process.env.VITE_DEV === "true" || process.env.NODE_ENV === "production")) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StudyFlow Backend running on http://localhost:${PORT}`);
    });
  }
}

// Global initialization
startServer().catch((err) => {
  console.error("Failed to initialize StudyFlow Backend:", err);
});

export default app;
