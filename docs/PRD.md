# SyncNote — Product Requirements Document

**Status:** Final (v1 shipped)
**Owner:** Akshat Gupta
**One-liner:** A clean note-taking app with autosave, AI-generated titles and an AI chat that can read your notes.

---

## 1. Problem

Quick notes pile up as "Untitled" because naming them is a chore, and once there are dozens, finding the one idea you need means scrolling. Heavy note apps solve this with folders and tags that take effort to keep up. A light notes app should save without a button, name notes by itself, and let you ask questions across everything you've written.

---

## 2. Goals (v1)

1. Accounts with email and password. Each user only sees their own notes.
2. Create, edit and delete notes in a rich-text editor that saves automatically.
3. Generate a short title for each note from its content.
4. An AI chat that answers using the user's notes as context.
5. Work on mobile.
6. Live demo at [syncnote.akshatgcodes.in](https://syncnote.akshatgcodes.in) with a demo account.

---

## 3. Non-Goals (explicit scope cuts)

- **Real-time collaboration** — notes belong to one user. Despite the name, there's no multi-device live sync beyond saving to the server.
- **Folders / tags** — the AI chat is the search and organisation layer.
- **Offline mode** — saving needs the server.
- **Sharing or public links** — notes are private.
- **Password reset** — there's no email service.

---

## 4. Users

**Primary:** Students and developers who jot quick notes and want them named and searchable without effort.

**Secondary:** Recruiters and engineers trying the demo account to see autosave, AI titles and chat working together.

---

## 5. User Stories

1. *As a new user,* I sign up and get a welcome note so that I know where to start.
2. *As a user,* I type in a note and stop, so that it's saved without pressing anything.
3. *As a user,* I write a note without a title so that SyncNote names it from the content.
4. *As a user,* I ask the AI "what were my ideas for the project?" so that I get an answer drawn from my notes.
5. *As a user,* I delete a note I don't need so that my list stays clean.
6. *As a mobile user,* I open the sidebar from the menu button so that I can switch notes on a small screen.

---

## 6. Functional Requirements

### 6.1 Auth

- Sign-up needs a name, email and password of 6+ characters. Emails are stored lowercase and must be unique.
- Passwords are hashed with bcrypt (10 rounds).
- Login and sign-up return a JWT valid for 30 days, which the client keeps in `localStorage`.
- Every `/api/notes`, `/api/chat` and `/api/title` call needs a `Bearer` token.

### 6.2 Notes

- New accounts get one welcome note.
- Notes are listed by `updated_at`, newest first.
- Edits are debounced: content is saved 900 ms after the last keystroke, and a manual title edit 700 ms after.
- A user can only read, update or delete notes where `user_id` is their own.

### 6.3 AI titles

- On each content save, the client sends the note's plain text to `/api/title`, which asks Groq for a title of at most 6 words.
- If there's no key, or the call fails, the title is the first 60 characters of the text. Empty notes are "Untitled".

### 6.4 AI chat

- `/api/chat` sends a system prompt containing each note's title and first 300 characters, plus the chat history, to Groq.
- If `GROQ_API_KEY` isn't set, it returns 503 "AI not configured".

---

## 7. Non-Functional Requirements

- **Resilience:** notes never depend on the AI. Title failures fall back silently.
- **Security:** bcrypt passwords, signed JWTs, every note query scoped to the token's user id, and the Groq key only on the server.
- **Cost:** free tiers only (Render, MongoDB Atlas M0, Groq).
- **Mobile:** the layout works on phone widths with a collapsible sidebar.

---

## 8. Success Metrics

| Metric | Target |
|---|---|
| Demo flow | Landing → logged into the demo account → editing a note in under a minute (after any cold start) |
| Autosave | No edit is lost when switching notes after a pause |
| AI titles | Every non-empty note gets a title without the user typing one |

---

## 9. Risks & Open Questions

- **Title overwrite** — the title is regenerated on every content save, so a title typed by hand is replaced on the next edit.
- **Stored HTML** — note content is saved as editor HTML and rendered back as HTML. Notes are private, so the risk is limited to a user's own account, but the server doesn't sanitise it.
- **Token storage** — the JWT is in `localStorage`, so any XSS on the page could read it.
- **Context size** — with many notes, the chat's context string grows without a cap.
- **Model churn** — Groq retires models. `GROQ_MODEL` makes switching a config change.

---

## 10. v2 Candidates

- Only auto-generate a title until the user edits it by hand.
- Sanitise note HTML on the server (for example with DOMPurify on save).
- Cap or rank the notes sent as chat context.
- Password reset by email.

---

<div align="center">

<h3>Akshat Gupta</h3>

<a href="https://akshatgcodes.in"><img src="https://img.shields.io/badge/Website-akshatgcodes.in-111111?style=flat-square&logo=googlechrome&logoColor=white" alt="Website"></a>
<a href="https://linkedin.com/in/akshatgcodes"><img src="https://img.shields.io/badge/LinkedIn-akshatgcodes-0A66C2?style=flat-square" alt="LinkedIn"></a>
<a href="https://github.com/akshatgcodes"><img src="https://img.shields.io/badge/GitHub-akshatgcodes-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
<a href="mailto:akshatgcodes@gmail.com"><img src="https://img.shields.io/badge/Email-akshatgcodes%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>

</div>
