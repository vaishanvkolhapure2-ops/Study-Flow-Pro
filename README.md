# StudyFlow Neural Pro 🚀

StudyFlow Neural Pro is an advanced, AI-powered academic orchestration platform designed to transform traditional study habits into high-performance active learning.

## ✨ Core Features

-   **🧠 Neural Chat Tutor:** Interactive learning assistant with real-time internet grounding (via Google Search) for up-to-date academic research.
-   **📅 AI Study Planner:** Generates multi-day, strategic study schedules tailored to your subjects and upcoming exams.
-   **🃏 Smart Revision:** automated flashcard generation with 3D flip animations and active recall tracking.
-   **🎬 Video Synthesizer:** Transform text prompts into cinematic educational sequences using the Veo 3.1 Lite model.
-   **🎙️ Text-to-Speech (TTS):** Natural voice output for tutor interactions to facilitate auditory learning.
-   **🎨 Concept Visualizer:** AI-generated diagrams and illustrations to help grasp complex scientific and mathematical concepts.
-   **📊 Strategic Insights:** Personalized daily "Mastery Strategy" based on your workload and study goals.

## 🛠️ Architecture

Full-stack application built with:
-   **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion.
-   **Backend:** Node.js / Express.js server (handled securely via proxy).
-   **Database & Auth:** Firebase Firestore & Firebase Authentication.
-   **AI Intelligence:** Google Gemini API (`@google/genai`).

## ⚙️ Setup & Configuration

### Environment Variables
Create a `.env` file based on `.env.example` and provide the following:
-   `GEMINI_API_KEY`: Your Google AI Studio API Key.
-   `PORT`: Defaults to 3000.

### Firebase Configuration
1.  Initialize a Firebase project.
2.  Enable **Authentication** (Google Login).
3.  Enable **Cloud Firestore**.
4.  Configure `firebase-applet-config.json` with your project credentials.
5.  Deploy the included `firestore.rules` to secure your database.

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🔒 Security
-   All AI interactions are proxied through the Express backend to keep API keys hidden from the client.
-   Firestore security rules enforce "Default Deny" and strict owner-based data isolation.

---
Built with StudyFlow AI - Your Neural Academic Partner.
