import { GoogleGenAI } from "@google/genai";

// Client-side instance for streaming only (Tutor)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Safe serializer to prevent circular issues
function safeStringify(obj: any) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return;
      cache.add(value);
    }
    return value;
  });
}

// Helper for backend proxy calls
async function callBackendAI(payload: any) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: safeStringify(payload)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'AI request failed');
  }
  const result = await response.json();
  return result.text;
}

export async function generateStudyPlan(subjects: string, days: number, standard: string = '12', stream?: string) {
  const prompt = `Create a comprehensive study plan for a student in Class ${standard}${stream ? ` (${stream} stream)` : ''}.
Subjects: ${subjects}
Days remaining: ${days}

Provide the output as a JSON array of objects, where each object represents a day.
Format: [{ day: number, focus: string, tasks: string[], tip: string }]`;

  return callBackendAI({
    prompt,
    schema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          day: { type: 'INTEGER' },
          focus: { type: 'STRING' },
          tasks: { type: 'ARRAY', items: { type: 'STRING' } },
          tip: { type: 'STRING' }
        },
        required: ["day", "focus", "tasks", "tip"]
      }
    }
  });
}

export async function generateQuiz(topic: string, standard: string = '12', stream?: string) {
  const prompt = `Generate a 5-question multiple choice quiz for a student in Class ${standard}${stream ? ` (${stream} stream)` : ''} on the topic: ${topic}.
Format: { topic: string, questions: [{ question: string, options: string[], correctAnswer: number }] }`;

  return callBackendAI({
    prompt,
    schema: {
      type: 'OBJECT',
      properties: {
        topic: { type: 'STRING' },
        questions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctAnswer: { type: 'INTEGER' }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      },
      required: ["topic", "questions"]
    }
  });
}

export async function getTutorResponse(history: { role: 'user' | 'model', parts: { text: string }[] }[], question: string, standard: string = '12', stream?: string) {
  // Keep streaming on client for fast interactive UI
  const model = ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: `You are StudyFlow AI Tutor, a highly effective and supportive mentor for students in Class ${standard}${stream ? ` (${stream} stream)` : ''}. 
Your goal is to explain complex academic concepts in an accessible, engaging, and clear manner.
Adapt your tone based on the user's needs—be professional for deep technical explanations, but encouraging and friendly for motivation.
Use examples relevant to the Indian curriculum (CBSE/ICSE) where appropriate.
If you need real-time information or specific syllabus details from the internet, use your search capabilities.
User question: ${question}` }] }
    ],
    config: {
      systemInstruction: `You are an expert, supportive AI tutor for Class ${standard}${stream ? ` (${stream} stream)` : ''} students. You help with study planning, concept explanation, and exam preparation. Your name is StudyFlow AI Tutor. You have access to Google Search to provide current and accurate academic data.`,
      tools: [{ googleSearch: {} }]
    }
  });

  return model;
}

export async function generateFlashcards(subject: string, standard: string = '12', count: number = 5) {
  const prompt = `Generate ${count} high-quality flashcards for revision. Subject: ${subject}, Standard: Class ${standard}. Format: [{ front: string, back: string }]`;

  return callBackendAI({
    prompt,
    schema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          front: { type: 'STRING' },
          back: { type: 'STRING' }
        },
        required: ["front", "back"]
      }
    }
  });
}

export async function generateVisual(concept: string) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: safeStringify({
      model: 'gemini-2.5-flash-image',
      prompt: `Create an educational, high-quality illustration or diagram showing: ${concept}. Clean, professional level.`
    })
  });
  
  if (!response.ok) return '';
  const result = await response.json();
  return result.text; 
}

export async function generateSpeech(text: string) {
  const response = await fetch('/api/ai/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: safeStringify({ text })
  });
  
  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
}
