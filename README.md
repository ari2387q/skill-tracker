# Skill Tracker

Concise full-stack monorepo README for development and deployment.

## Summary
- Frontend: `Next.js` (App Router) + React + TypeScript + Tailwind CSS — located in `frontend/`.
- Backend: `Node.js` + `Express` + TypeScript + MongoDB (Mongoose) — located in `server/`.

## Repo layout (key folders)
- `frontend/` — Next.js app, run/build from here.
- `server/` — Express API server (TypeScript), separate service.

## Prerequisites
- Node.js (v18+ recommended)
- npm (or yarn/pnpm)

## Local development
# Skill Tracker — Detailed Overview

This repository is a full-stack monorepo for a personal skill-tracking application. It contains a production-ready Next.js frontend and a TypeScript Express backend with MongoDB persistence and optional AI coaching features.

Contents at a glance
- `frontend/` — Next.js (App Router) + React + TypeScript + Tailwind CSS UI, client-side logic, auth client and API calls.
- `server/` — Express + TypeScript API providing authentication, skill management, practice logs, dashboard aggregation, and an AI chat assistant backed by an external model.

Tech stack
- Frontend: Next.js (App Router), React 19, TypeScript, Tailwind CSS, `react-hook-form`, `zod` (present in deps), `zustand` for state.
- Backend: Node.js + Express, TypeScript, Mongoose (MongoDB), JWT auth, `zod` (present in deps), `@google/generative-ai` and OpenRouter integration for AI.

Primary use cases
- Track user skills (create, toggle active, mark practiced)
- Record practice sessions (logs) with notes, duration, timestamp
- View aggregated dashboard data (skills + logs) for progress and streaks
- Authentication (register/login/profile) with JWT
- Ask an AI coach for study advice or guidance; chat history persisted per user

Database and persistence
- MongoDB (Mongoose) models:
  - `User` (`server/src/modules/auth/user.model.ts`): email, password (hashed), streak, lastStudyDate, role, timestamps.
  - `Skill` (`server/src/modules/skills/skill.model.ts`): name, user reference, streak, lastpracticed, isActive, timestamps.
  - `Log` (`server/src/modules/logs/log.model.ts`): user, skill, practicedAt, notes, duration, timestamps.
  - `AIChat` (`server/src/modules/ai/ai.model.ts`): per-user chat history array (role + content + timestamp).

Authentication & security
- JWT-based auth. Token generated in `server/src/modules/auth/auth.controller.ts` using `JWT_SECRET`.
- `protect` middleware (`server/src/middlewares/auth.middleware.ts`) validates tokens and attaches `user` to requests.

Environment variables (used in repo)
- Backend (keep private):
  - `MONGO_URI` — MongoDB connection string (used in `server/src/db/mongo.ts`).
  - `JWT_SECRET` — secret for signing JWTs.
  - `PORT` — server port (defaults to 5000).
  - `OPENROUTER_API_KEY` — API key for AI calls (used in `server/src/modules/ai/ai.service.ts`).
- Frontend (public prefix required for browser):
  - `NEXT_PUBLIC_API_URL` — base URL for API calls (defaults to `http://localhost:5000/api`).

Server routes and capabilities (all under `/api`)
- `POST /api/auth/register` — Register user. Body: `{ email, password }`. Returns `{ token, user }`.
- `POST /api/auth/login` — Login. Body: `{ email, password }`. Returns `{ token, user }`.
- `GET /api/auth/profile` — Protected. Returns logged-in user's profile.

- `GET /api/skills` — Protected. Returns user's skills.
- `POST /api/skills` — Protected. Body: `{ name }`. Create skill.
- `PATCH /api/skills/:id/toggle` — Protected. Toggle `isActive` for a skill.
- `POST /api/skills/:id/practice` — Protected. Mark a skill as practiced (updates streak/lastpracticed).

- `POST /api/logs` — Protected. Create practice log. Body: `{ skillId, notes?, duration?, practicedAt? }`.
- `GET /api/logs` — Protected. Get all user logs.
- `GET /api/logs/grouped` — Protected. Returns logs grouped by date and skill (aggregated view used for UI dashboards).
- `GET /api/logs/skill/:skillId` — Protected. Logs for a specific skill.
- `PATCH /api/logs/:logId` — Protected. Update a log's notes/duration/practicedAt.
- `DELETE /api/logs/:logId` — Protected. Delete a log.

- `GET /api/dashboard` — Protected. Returns aggregated dashboard data (skills, logs, metrics).

- `POST /api/ai` — Protected. Send a `prompt` to the AI coach. Body: `{ prompt }`. Returns AI response and persists a limited chat history per user.
- `GET /api/ai/history` — Protected. Returns stored AI chat messages for the user.

Implementation notes & behaviors
- Auth: passwords are hashed with bcrypt (see `user.model.ts` pre-save hook). Login compares hashes via `comparePassword`.
- Skill uniqueness: `Skill` has an index for `{ name, user }` ensuring a user cannot duplicate the same skill name.
- Logs: unique index on `{ user, skill, practicedAt }` prevents duplicate logs for the same skill at the same timestamp.
- Dashboard: `dashboard.service` aggregates skills and logs to build metrics and timelines used in the UI.
- AI: `ai.service` keeps a per-user chat (`AIChat`) and sends a trimmed message history to the external model (OpenRouter). It enforces timeouts and message limits, and cleans formatting of AI responses before saving.

Frontend
- The Next.js app (`frontend/`) handles UI, auth flow (stores token client-side), and calls backend APIs via `frontend/lib/api.ts` (uses `NEXT_PUBLIC_API_URL`).
- Forms use `react-hook-form`; `zod` is present in dependencies and can be used for validation (resolver present as a dependency).

Development workflow
1. Run backend
```bash
cd server
npm install
# dev: uses ts-node
npm run dev
```
2. Run frontend
```bash
cd frontend
npm install
npm run dev
```
3. Use Postman/Insomnia or the UI to register, log in, and exercise endpoints. Ensure `NEXT_PUBLIC_API_URL` points to the running backend when testing the UI.

Deployment guidance
- Frontend (recommended): Deploy `frontend/` to Vercel as a Next.js project. Set Root Directory to `frontend` and add `NEXT_PUBLIC_API_URL` in Vercel env settings.
- Backend (recommended): Deploy `server/` to a host for long-running Node servers (Railway, Render, DigitalOcean App Platform). Add `MONGO_URI`, `JWT_SECRET`, and `OPENROUTER_API_KEY` to the host's secrets.
- Optional: Convert backend endpoints to serverless functions or Next.js API routes if you want everything on Vercel, but a direct Express app is simpler on traditional Node hosts.

Security & best practices
- Do not commit `.env` files. Use host secret managers.
- Use HTTPS for production and restrict CORS origins (currently `http://localhost:3000` in `server/src/app.ts`).
- Rotate `JWT_SECRET` and API keys when necessary.

Where to look in the code
- Server entry: `server/src/server.ts` and `server/src/app.ts` (route mounting and middleware).
- Auth: `server/src/modules/auth/*` (models, service, controller, routes).
- Skills: `server/src/modules/skills/*` (model, service, controller, routes).
- Logs: `server/src/modules/logs/*` (model, service, controller, routes).
- AI: `server/src/modules/ai/*` (model, service, controller, routes) — uses `OPENROUTER_API_KEY` and `@google/generative-ai` packages.
- Frontend entry: `frontend/app/`, API helper: `frontend/lib/api.ts`, auth context: `frontend/contexts/auth-context.tsx`.

Extras I can provide
- Full API examples with request/response payloads for each endpoint.
- A `vercel.json` example and Vercel project settings for `frontend`.
- A script to list all `process.env` keys used by the codebase.

If you'd like one of those, tell me which and I'll add it next.
