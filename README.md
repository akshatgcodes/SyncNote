<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
       fill="none" stroke="#2d6a4f" stroke-width="1.5"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/>
    <path d="M15 3v4a2 2 0 0 0 2 2h4"/>
  </svg>
</p>

<h1 align="center">SyncNote</h1>

<p align="center">
  <strong>A clean note-taking app with autosave, AI-generated titles and an AI chat that can read your notes.</strong>
</p>

<p align="center">
  <a href="https://syncnote.akshatgcodes.in">
    <img src="https://img.shields.io/badge/live_demo-2d6a4f-2d6a4f?style=flat-square" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Groq-F55036?style=flat-square" alt="Groq">
  <img src="https://img.shields.io/badge/license-GPL--3.0-2d6a4f?style=flat-square" alt="License">
</p>

---

## What is SyncNote?

SyncNote is a distraction-free notes app that saves as you type and names your notes for you. Write anything and, a moment later, it's saved with a short title generated from the content. A built-in AI assistant has your notes as context, so you can ask it to summarise them, find an idea or suggest what to work on next.

> **Live demo →** [syncnote.akshatgcodes.in](https://syncnote.akshatgcodes.in)
> Log in with `demo@example.com` / `demo1234`, or sign up free. The free host sleeps when idle, so the first load can take up to a minute.

---

## What you get

- **Accounts** — sign up and log in. Passwords are hashed with bcrypt, and sessions use a 30-day JWT.
- **Autosave** — edits are saved 0.9 s after you stop typing, with bold, italic, lists and headings in a rich-text editor.
- **AI titles** — each save asks Groq for a title of up to 6 words. Without an API key, the first line becomes the title.
- **AI chat** — ask questions about your notes. The assistant gets each note's title and opening text as context.
- **Mobile layout** — a collapsible sidebar on small screens.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite 5 · Next.js 16 static landing page |
| Backend | Node.js · Express 4 |
| Database | MongoDB Atlas · Mongoose |
| Auth | JWT (`jsonwebtoken`) · bcryptjs |
| AI | Groq API · `openai/gpt-oss-120b` (configurable with `GROQ_MODEL`) |
| Infra | Render (one Node web service) · GoDaddy DNS |

---

## Engineering Decisions

**Why does the AI degrade instead of failing?**
Titles fall back to the note's first 60 characters when Groq is down or no key is set, and chat returns "AI not configured". The notes themselves never depend on the AI.

**Why one Express server for the landing page, the app and the API?**
One Render service serves the landing page at `/`, the React build at `/app/` and the API at `/api/*`. The frontend calls the API on the same origin, so there's no CORS in production.

**Why make the model an env var?**
Groq retired the original model, which broke chat in production. `GROQ_MODEL` means the next retirement is a config change, not a deploy.

**What would you do differently in v2?**
Stop re-generating the title on every save, so a title you typed yourself sticks, and sanitise stored note HTML on the server.

---

## Docs

| Document | Description |
|---|---|
| [PRD](docs/PRD.md) | Product requirements — goals, user stories, non-goals |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, AI design |
| [Decisions](docs/DECISIONS.md) | Every major technical decision and why |
| [Setup](docs/SETUP.md) | Local dev setup and env vars |
| [Deploy](docs/DEPLOY.md) | Production deployment, domains, rollback |
| [Contributing](CONTRIBUTING.md) | How to propose changes |
| [Changelog](CHANGELOG.md) | What changed in each release |
| [Security](SECURITY.md) | How to report a vulnerability |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
