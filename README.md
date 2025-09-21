# Läntenweid – German Language Trainer

Läntenweid is a friendly AI-powered German tutor for every stage of your journey. Pick your level (A, B, or C), chat in natural language, and get guided corrections, translations, and practice prompts.

- A (Beginner): short, simple German with English translations and gentle guidance.
- B (Intermediate): mostly German with helpful clarifications and vocabulary expansion.
- C (Advanced): natural, fluent German with nuanced feedback and advanced topics.

The project is a small static frontend plus a lightweight Node/Express API that calls Google	GenAI (Gemini).

---

## What you can do

- Choose your level (A/B/C) and chat with an AI tutor tailored to that level
- Type freely to practice everyday German or dive into topics you care about
- See Markdown-formatted responses (examples, lists, bold text) for readability
- Keep conversational context so the tutor can build on prior messages (in-memory)

> Tip: Beginners can ask for translations or short practice phrases at any time. Intermediates get synonyms and idioms. Advanced learners can explore complex grammar and cultural topics.

---

## Tech stack

- Frontend: Static HTML/CSS/JS (Bootstrap 5, Marked for Markdown rendering)
- Backend: Node.js + Express 5, CORS, dotenv
- AI: Google GenAI (Gemini 2.5 Flash) via `@google/genai`
- Deploy (static): Netlify (publishes the `docs` folder)

Project structure:

```
netlify.toml           # Netlify config (publishes docs/)
package.json           # Node dependencies and scripts
scripts/
  aiServer.js          # Express API that proxies requests to Google GenAI
  index.js             # Frontend behavior (level switch, chat, calls API)
docs/
  index.html           # App UI
  style.css            # Styling
```

---