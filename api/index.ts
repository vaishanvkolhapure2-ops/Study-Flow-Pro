import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create and export the Express app instance
export const app = express();

async function startServer() {
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI on the server Side
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Secure AI Proxy Route
  // This keeps our logic and keys safe from the client
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
               prebuiltVoiceConfig: { voiceName: 'Kore' },
             },
           },
         },
       });

       res.json({ data: result.text }); // For TTS, the text field often contains base64 in this wrapper
    } catch (error: any) {
      console.error("TTS Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite Middleware integration
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

  // Only start listening if run directly (not as a serverless function)
  if (process.env.NODE_ENV !== "production" || process.env.VITE_DEV === "true") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`StudyFlow Backend running on http://localhost:${PORT}`);
    });
  }
}

// Global initialization
if (process.env.VERCEL !== '1') {
  startServer().catch((err) => {
    console.error("Failed to start StudyFlow Backend:", err);
  });
}

export default app;
