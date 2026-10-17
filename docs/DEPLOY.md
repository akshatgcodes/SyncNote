# Deploying SyncNote

> **Live:** [syncnote.akshatgcodes.in](https://syncnote.akshatgcodes.in) · **Host:** Render · **Auto-deploy:** on push to `main`

For local development, see [SETUP.md](SETUP.md).

---

## 1. Architecture in production

| Piece | Runs on | Notes |
|---|---|---|
| Landing page | Render (same service) | `landing/out`, built during deploy, served at `/` |
| React app | Render (same service) | `client/dist`, served at `/app/` |
| API | Render web service `syncnote-server` | Root dir `server`, free tier, Oregon; sleeps after 15 min idle |
| Database | MongoDB Atlas M0 | Cluster `syncnote`, `AP_SOUTHEAST_1`; network access open to Render (`0.0.0.0/0`) |
| AI | Groq API | `openai/gpt-oss-120b` |
| DNS | GoDaddy | `syncnote.akshatgcodes.in` → CNAME to `syncnote-server-e4vq.onrender.com` |

---

## 2. Environment variables

Set in Render → `syncnote-server` → Environment. Names are in [`server/.env.example`](../server/.env.example).

| Variable | Required | Where it's set |
|---|---|---|
| `MONGO_URI` | ✅ | Render env. Atlas connection string for user `syncnote` |
| `JWT_SECRET` | ✅ | Render env. Long random string; changing it logs everyone out |
| `GROQ_API_KEY` | ❌ | Render env. Without it, chat is off and titles fall back to text |
| `GROQ_MODEL` | ❌ | Render env. Override when Groq retires the default model |

> After changing an env var, **redeploy** (Render → Manual Deploy). Running instances don't pick up new values.

---

## 3. First-time deploy

1. [dashboard.render.com](https://dashboard.render.com) → New → **Web Service** → connect `akshatgcodes/SyncNote`
2. Root directory: `server`
3. Build command: `npm ci && cd ../client && npm ci && npm run build && cd ../landing && npm ci && npm run build`
4. Start command: `npm start`
5. Add the env vars from section 2, then deploy

The same settings are in [`render.yaml`](../render.yaml).

**Atlas:** create a database user and allow network access from `0.0.0.0/0`. Render's free tier has no static outbound IPs, so the database is protected by the user's password instead.

---

## 4. Database migrations

None. Mongoose creates collections on first write. Schema changes are additive fields with defaults.

---

## 5. Custom domain

`syncnote.akshatgcodes.in` is set up with the setup toolkit:

```powershell
.\scripts\setup-subdomain.ps1 -Subdomain "syncnote" -Platform Render -RenderHost "syncnote-server-e4vq.onrender.com"
```

Manual fallback: add the domain in Render → Service → Settings → Custom Domains, then create a GoDaddy CNAME `syncnote` → `syncnote-server-e4vq.onrender.com`. HTTPS certificates are issued automatically once DNS resolves (2–10 min).

---

## 6. Verify a deploy

- [ ] `https://syncnote.akshatgcodes.in` loads the landing page
- [ ] **Try it live** opens `/app/`, and logging in with the demo account works
- [ ] Typing in a note and pausing saves it and sets a title
- [ ] The AI chat answers a question about a note

---

## 7. Rollback

| Host | How |
|---|---|
| Render | Service → Events → last good deploy → **Rollback** |
| Database | Atlas M0 has no automated backups. Export with `mongodump` before risky changes |

After rolling back, note it in a commit or PR so the next push doesn't silently re-ship the broken version.

---

## 8. Monitoring & logs

- **Logs:** Render → `syncnote-server` → Logs. The boot log shows "MongoDB connected ✓" and the AI status
- **Errors:** none yet beyond Render's logs
- **Uptime:** none yet
- **Dependencies:** Dependabot opens weekly update PRs and a maintenance report is emailed every week (see `.github/workflows/`)

---

## Known production limitations

- The free instance sleeps after 15 minutes idle, so the first request can take up to a minute.
- Groq retires models without much notice. If chat starts failing, check the logs and set `GROQ_MODEL`.
- Atlas M0 has no point-in-time backups.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
