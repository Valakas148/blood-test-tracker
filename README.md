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

## 🌐 Live Demo

This project is deployed on **Vercel**.

* **Production URL:** [blood-test-tracker-beta.vercel.app](https://blood-test-tracker-beta.vercel.app)

---

## 🛠 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bloodtrack-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

**⚠️ Note on API Rate Limits:** This MVP is currently configured using the **Google Gemini Free Tier**. The `gemini-2.5-flash` model has a strict rate limit of **5 requests per minute**. If you encounter extraction or chat errors during active testing, please wait a minute before retrying. The application implements an automatic retry mechanism with exponential backoff to mitigate this, but sustained rapid usage may still trigger a `503` or `429` error.

---

## 🧠 Architecture Decisions & Trade-offs

This MVP was built with a strong bias toward **privacy, reliability, and fast iteration**.

- **Local-first by design (IndexedDB):** Health data is sensitive, so all records stay on the user’s device with no backend dependency. This removes infrastructure overhead for the MVP while keeping PHI private by default.
  - *Production path:* move to a secure cloud architecture (object storage for source files, relational DB for normalized biomarkers, and auth/identity layer).
- **Server-state patterns on top of local data (TanStack Query):** I used React Query not just for fetching, but as a consistent data orchestration layer (cache, invalidation, mutation lifecycle). This keeps UI updates predictable and avoids ad-hoc state glue code.
- **Defensive AI extraction pipeline:** LLM output is treated as untrusted input. The flow includes retry with backoff for transient model/API failures and strict schema validation before data reaches the UI.

---

## 🤖 AI Usage Note

AI tools (including Cursor, Gemini, and Claude) were actively utilized throughout the development lifecycle of this project. My primary goal was to leverage AI as a highly efficient coding assistant to accelerate boilerplate generation, allowing me to focus on architecture, state management, and edge cases.

**Where AI helped me most:**
* **Scaffolding & Boilerplate:** Rapidly generating the initial Next.js App Router structure, SCSS Modules, and generic UI components (Buttons, Cards, Inputs).
* **Data Structures:** Generating TypeScript interfaces and basic Zod schemas based on the expected JSON payloads.
* **Routine Logic:** Brainstorming initial regex patterns, drafting standard API route handlers, and creating the baseline setup for TanStack Query hooks.
* **Prompt Engineering:** Iterating on the system prompt for the Gemini API to ensure consistent JSON extraction from unpredictable medical PDFs.

**What I verified or changed manually (The Human Touch):**
* **Architectural Boundaries:** AI frequently hallucinates or misunderstands the strict boundaries between Server and Client Components in Next.js. I manually audited all `"use client"` directives and API routes to ensure secure execution and avoid leaking browser APIs to the server.
* **State Management & Performance:** AI tends to overuse `useState` and `useEffect` for data handling. I manually refactored the data flow to rely on TanStack Query for caching and `useMemo` for derived state (e.g., calculating Trends charts), ensuring optimal re-renders. 
* **Type Safety & Validation:** AI often generated lazy type assertions (`as File` or `any`). I manually enforced strict Type Guards (e.g., `instanceof File`) and implemented robust Zod validation for all runtime data coming from the LLM or user inputs.
* **UI/UX & Accessibility:** While AI generated the basic CSS, it often missed accessibility standards. I manually wired Radix UI primitives, fixed complex edge cases like splitting the `react-day-picker` into independent logic blocks.

**Limitations or mistakes encountered:**
* LLMs often struggled with the nuances of the Next.js App Router boundary rules (mixing Server and Client component logic).
* **Context Loss:** When generating complex logic (like the IndexedDB wrapper or offline sync flows), the AI often lost track of the broader application state, requiring manual intervention to prevent race conditions