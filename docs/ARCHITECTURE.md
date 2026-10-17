# SyncNote — Architecture

---

## 1. Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 single-page app built with Vite 5 (`client/`), served under `/app/` |
| Editor | `contentEditable` with `document.execCommand` (bold, italic, underline, H1, H2, lists) |
| Backend | Node.js · Express 4 (`server/index.js`, ES modules) |
| Database | MongoDB Atlas M0 · Mongoose |
| Auth | `jsonwebtoken` (30-day tokens) · `bcryptjs` |
| AI | Groq OpenAI-compatible chat API · `openai/gpt-oss-120b` by default |
| Landing page | Next.js 16 static export (`landing/out`) · Tailwind CSS 4 |
| Hosting | One Render web service (free tier, Oregon) |

---

## 2. Components

```
server/index.js     Express app: models, auth middleware, notes CRUD, AI routes, static hosting
client/src/App.jsx  React app: auth screen, note list, editor with autosave, AI chat panel
client/vite.config  base "/app/", dev proxy /api -> localhost:3001
landing/            Next.js landing page, exported to landing/out at build time
render.yaml         Render service definition
```

### Static hosting

```js
app.use("/app", express.static("client/dist"));   // React build
app.use(express.static("landing/out"));           // landing page at "/"
app.get("/app/*", sendClientIndex);               // SPA fallback
```

### Auth middleware

`auth()` reads `Authorization: Bearer <jwt>`, verifies it with `JWT_SECRET`, and puts `{ id, email, name }` on `req.user`. Missing or invalid tokens get 401.

### Editor and autosave (`NoteEditor`)

On input, a 900 ms debounce timer starts. When it fires, the client:

1. reads the editor's `innerHTML` (content) and `innerText` (plain text),
2. posts the plain text to `/api/title`, falling back to the first 60 characters,
3. `PUT`s `{ title, content }` to `/api/notes/:id`.

Editing the title field by hand saves after 700 ms.

### AI chat (`AiChat`)

It builds `notesContext` from every note (`"title": first 300 chars of content`) and posts it with the chat history to `/api/chat`.

---

## 3. Data Flow

```
[Browser] GET /                 --> landing/out/index.html
[Browser] GET /app/             --> client/dist/index.html (React)
React --> POST /api/login       --> bcrypt.compare --> jwt.sign (30d) --> localStorage
React --> GET  /api/notes       --> Note.find({ user_id }) sorted by updated_at desc
typing --> 900 ms debounce
      --> POST /api/title       --> Groq (max_tokens 256, reasoning_effort low) --> title
      --> PUT  /api/notes/:id   --> Note.findOne({ _id, user_id }) --> save
chat  --> POST /api/chat        --> Groq (system prompt + notes context + history) --> reply
```

---

## 4. Database Schema

- `users` — `name`, `email` (unique, lowercase), `password` (bcrypt hash), `created_at` (unix seconds)
- `notes` — `user_id` (ObjectId of the owner), `title` (default "Untitled"), `content` (editor HTML), `created_at`, `updated_at` (unix seconds)

**Indexes:** the unique index on `users.email`. Note queries filter on `user_id`, and an index there would be the first addition as data grows.

---

## 5. AI / LLM Design

### Input

- **Titles:** the note's plain text, first 500 characters, as the user message.
- **Chat:** a system prompt ("You are SyncNote AI - helpful and friendly. User notes: …") with each note's title and first 300 characters of content, followed by the conversation so far.

### System prompt strategy

- **Titles:** "Generate a short, concise title (max 6 words)… Reply with ONLY the title, no quotes, no punctuation at the end."
- **Chat:** a short persona, with the notes inlined as context. There's no instruction to refuse questions that aren't about the notes.

### Response handling

- Both routes read `choices[0].message.content` from the OpenAI-compatible response.
- `gpt-oss-120b` is a reasoning model, so requests set `reasoning_effort: "low"` and leave enough room (`max_tokens` 256 for titles, 2048 for chat) for the answer after the reasoning.

### Failure handling

| Case | Title route | Chat route |
|---|---|---|
| No `GROQ_API_KEY` | First 60 characters of the text | 503 "AI not configured" |
| Groq error or empty reply | First 60 characters of the text | 500 with the error message |
| Empty note | "Untitled" with no API call | — |

---

## 6. API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/register` | Create an account + welcome note, return JWT |
| `POST` | `/api/login` | Check password, return JWT |
| `GET` | `/api/me` | Current user from the token |
| `GET` | `/api/notes` | The user's notes, newest first |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes/:id` | Update title and/or content (owner only) |
| `DELETE` | `/api/notes/:id` | Delete (owner only) |
| `POST` | `/api/title` | Generate a title from content |
| `POST` | `/api/chat` | Chat with notes as context |

---

## 7. Security

- **Passwords:** bcrypt with 10 salt rounds. Hashes never leave the server.
- **Tokens:** HS256 JWTs signed with `JWT_SECRET` (a Render env var), expiring after 30 days.
- **Data isolation:** every note read, update and delete filters on `{ user_id: req.user.id }`.
- **AI key:** `GROQ_API_KEY` is only used server-side. The browser never sees it.
- **CORS:** production is same-origin. The allow-list (`syncnote2.vercel.app`, localhost) only matters for a separately hosted frontend.
- **Known gaps:** note HTML isn't sanitised on the server, the JWT lives in `localStorage`, there's no rate limit on login or AI routes, and note content in the chat context could carry prompt-injection text.

---

## 8. Error Handling & Reliability

| Failure | Behaviour |
|---|---|
| Wrong password / unknown email | 401 with a specific message |
| Duplicate email | 409 |
| Note not found or not owned | 404 |
| MongoDB unreachable at boot | Server exits on the failed `mongoose.connect` |
| Groq down | Titles fall back to text, chat returns an error message |
| Render instance asleep | First request wakes it, which takes up to a minute |

---

## 9. Deployment

1. Render web service `syncnote-server` (free, Oregon), root dir `server`, connected to `akshatgcodes/SyncNote`, auto-deploys on push to `main`.
2. Build: `npm ci && cd ../client && npm ci && npm run build && cd ../landing && npm ci && npm run build`.
3. Start: `npm start` (`node index.js`).
4. Env vars: `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`, optional `GROQ_MODEL`.

Full steps are in [DEPLOY.md](DEPLOY.md).

---

## 10. Explicit Scope Cuts

- **Collaboration / real-time sync** — single-user notes.
- **Folders and tags** — the AI chat is the organisation layer.
- **Offline support** — saving needs the server.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
