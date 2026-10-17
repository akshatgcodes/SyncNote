# Engineering Decisions — SyncNote

---

## Decision 1 — AI features degrade, they never block

**Context:** Titles and chat depend on a third-party API with rate limits, outages and model retirements. Notes are the core product.

**Decision:** `/api/title` falls back to the first 60 characters of the text when there's no key or the call fails. `/api/chat` returns a clear error. Saving a note never waits on a successful AI call.

**Reason:** A Groq outage turns "smart titles" into "plain titles" instead of "can't save". The app also runs fully without any AI key.

**Tradeoff:** Fallback titles are cruder, and a failed chat shows an error rather than a retry.

---

## Decision 2 — Model name in an env var

**Context:** Groq retired `llama-3.3-70b-versatile`, which had been hard-coded, and chat broke in production.

**Decision:** `GROQ_MODEL` (default `openai/gpt-oss-120b`), with `reasoning_effort: "low"` and higher `max_tokens`, because the new model is a reasoning model.

**Reason:** The next retirement is an env change and a restart, not a code change and a deploy. The token headroom matters: with the old 20-token limit for titles, the reasoning model spent every token thinking and returned an empty title.

**Tradeoff:** A different model could behave differently with the same prompts, so a model switch still needs a quick manual check.

---

## Decision 3 — One Render service for the landing page, the app and the API

**Context:** The React frontend used to be on a separate Vercel deployment, with CORS rules and a `VITE_API_URL` to find the API.

**Decision:** Express serves `landing/out` at `/`, the Vite build at `/app/` (`base: "/app/"`), and the API at `/api/*`, all from one service.

**Reason:** One domain, one deploy and no CORS in production. The frontend calls `/api` on the same origin.

**Tradeoff:** The free Render instance sleeps after 15 minutes idle, so the landing page shares the API's cold start.

---

## Decision 4 — Debounced autosave with titles generated on save

**Context:** A save button is friction, and saving on every keystroke would flood the API.

**Decision:** Content saves 900 ms after the last keystroke, and each save first asks for a fresh title. Manual title edits save after 700 ms.

**Reason:** Notes feel saved instantly without a request per character, and every note gets a meaningful title with no effort.

**Tradeoff:** The title is regenerated on every content save, so a title you typed yourself is replaced the next time you edit the body. That's the first thing to change in v2.

---

## Decision 5 — JWT in `localStorage` instead of cookie sessions

**Context:** The frontend was originally hosted on a different domain from the API.

**Decision:** Login returns a 30-day JWT that the client stores in `localStorage` and sends as a `Bearer` header.

**Reason:** It works across origins without cookie `SameSite` setup, and the server stays stateless.

**Tradeoff:** Any XSS could read the token. Now that everything is same-origin, an `httpOnly` cookie would be safer.

---

## What I'd do differently in v2

- **Keep manual titles** — only auto-title until the user edits the title.
- **Sanitise note HTML on the server**, and move the token to an `httpOnly` cookie.
- **Cap the chat context** — rank or truncate notes instead of sending all of them.

---

## Explicit non-decisions (deferred to v2)

| Feature | Why deferred |
|---|---|
| Real-time multi-device sync | Needs WebSockets or polling and conflict handling |
| Folders / tags | The AI chat covers "find my note about X" |
| Password reset | Needs a transactional email service |

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
