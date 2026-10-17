# SyncNote

A clean, friendly note-taking app with AI chat — powered by an Express + MongoDB backend.

## Quick Start

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server
```bash
cd server
cp .env.example .env
```
Open `server/.env` and set:
- `MONGO_URI` — a MongoDB connection string (local or a free MongoDB Atlas cluster). Required.
- `GROQ_API_KEY` — a free key from https://console.groq.com. Optional; without it AI chat is disabled and titles fall back to the note's first line.
- `JWT_SECRET` — any long random string.

### 3. Run the app (two terminals)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Runs at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Runs at http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Features
- ✅ Register & login (stored in MongoDB)
- ✅ Create, edit, delete notes (autosaved)
- ✅ AI chat assistant that can see your notes (Groq)
- ✅ AI-generated note titles

## Stack
- **Frontend:** React + Vite
- **Backend:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT tokens + bcrypt passwords
- **AI:** Llama 3.3 70B via the Groq API (free tier)
