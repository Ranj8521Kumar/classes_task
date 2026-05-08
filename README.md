# DoubtDesk

DoubtDesk is a full-stack doubt solver for Class 6-12 students. A student selects their class, subject, answer mode, and language, then pastes a question to receive a structured Gemini explanation.

## Tech Stack

- Frontend: Vite, React, TypeScript
- Backend: Express, TypeScript, Zod
- AI: Gemini via `@google/genai`

## Local Setup

```bash
npm install
cp server/.env.example server/.env
npm run dev:server
npm run dev:client
```

Set `GEMINI_API_KEY` in `server/.env`.

## Scripts

```bash
npm run test
npm run build
```

## API

- `GET /api/health`
- `POST /api/solve-doubt`

```json
{
  "grade": "8",
  "subject": "Math",
  "mode": "step-by-step",
  "language": "English",
  "question": "How do I solve 2x + 5 = 13?"
}
```
