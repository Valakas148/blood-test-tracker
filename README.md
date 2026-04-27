# BloodTrack AI 

A modern, local-first Next.js web application that allows users to upload blood test reports (PDF, Image, CSV), automatically extract biomarkers using AI, track trends over time, and interact with their medical data via an AI chat.

## 🚀 Tech Stack
* **Framework:** Next.js 15 (App Router), React 18
* **Language:** TypeScript
* **State Management & Caching:** TanStack Query (React Query)
* **Styling:** SCSS Modules (Custom Design System, variables-driven)
* **Database:** IndexedDB (via `idb` wrapper) for zero-backend, privacy-first local storage
* **AI Integration:** Google Gemini 2.5 Flash (via `@google/generative-ai` & Vercel AI SDK)
* **UI Components:** Radix UI (Primitives), Recharts (Trends), React-Day-Picker

---

## 🛠 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blood-test-tracker