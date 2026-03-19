# SyncNote

A clean, friendly note-taking app with AI chat — powered by Express + SQLite backend.

## Quick Start

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Set up your API key (for AI Chat)
```bash
cd server
cp .env.example .env
```
Open `server/.env` and add your free Gemini key from https://aistudio.google.com

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
- ✅ Register & login (stored in SQLite database)
- ✅ Create, edit, delete notes (autosaved)
- ✅ AI chat assistant (Google Gemini)
- ✅ Notes persist forever in `server/syncnote.db`

## Stack
- **Frontend:** React + Vite
- **Backend:** Express.js
- **Database:** SQLite (file: `server/syncnote.db`)
- **Auth:** JWT tokens + bcrypt passwords
- **AI:** Google Gemini 2.0 Flash (free)
