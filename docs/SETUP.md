# Local Setup — SyncNote

> **Just want to try it?** Use the live demo at [syncnote.akshatgcodes.in](https://syncnote.akshatgcodes.in) and log in with `demo@example.com` / `demo1234`.
> This guide is for running SyncNote locally or self-hosting it.

---

## Prerequisites

- Node.js 20+
- A MongoDB database: local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) M0 cluster
- A [Groq](https://console.groq.com) API key, optional (for AI titles and chat)

---

## 1. Clone and install

```bash
git clone https://github.com/akshatgcodes/SyncNote
cd SyncNote
cd server && npm install
cd ../client && npm install
cd ..
```

---

## 2. Environment variables

```bash
cp server/.env.example server/.env
```

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Required. `mongodb://localhost:27017/syncnote`, or Atlas → Connect → Drivers |
| `JWT_SECRET` | Any long random string |
| `GROQ_API_KEY` | Optional. [console.groq.com/keys](https://console.groq.com/keys). Without it, chat is off and titles use the first line |
| `GROQ_MODEL` | Optional. Defaults to `openai/gpt-oss-120b` |
| `PORT` | Optional. Defaults to `3001` |

---

## 3. Run locally (two terminals)

```bash
# terminal 1: API on http://localhost:3001
cd server && npm run dev

# terminal 2: React app on http://localhost:5173 (proxies /api to :3001)
cd client && npm run dev
```

Open `http://localhost:5173`, sign up, and start writing. `start.sh` at the repo root starts both in one go.

### Production-like run (one server)

```bash
cd client && npm run build && cd ../landing && npm install && npm run build && cd ../server
npm start   # http://localhost:3001 → landing at /, app at /app/
```

---

## 4. Deploy to production

See [DEPLOY.md](DEPLOY.md) for production deployment, custom domain and rollback steps.

---

## Testing

There's no automated test suite yet. CI builds the React client and lints and builds the landing page. To check a change by hand: sign up, write a note and pause (it should save and get a title), reload (it's still there), ask the AI chat about the note, and delete it.

---

## Known local-only limitations

- In dev mode (`npm run dev` in `client/`), the app runs at `/` on port 5173. In production it's served under `/app/`.
- The server exits at startup if `MONGO_URI` is set but unreachable.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
