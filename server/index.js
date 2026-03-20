import "dotenv/config";
import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "syncnote-dev-secret-change-in-production";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

// DB
const dbFile = join(__dirname, "syncnote.json");
const adapter = new JSONFile(dbFile);
const db = new Low(adapter, { users: [], notes: [] });
await db.read();
db.data ||= { users: [], notes: [] };
await db.write();

const nextId = (arr) => arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
const now = () => Math.floor(Date.now() / 1000);

app.use(cors({ 
  origin: ['https://syncnote2.vercel.app', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true 
}));
app.use(express.json({ limit: "2mb" }));

const distPath = join(__dirname, "../client/dist");
if (fs.existsSync(distPath)) app.use(express.static(distPath));

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  await db.read();
  if (db.data.users.find(u => u.email === email.trim().toLowerCase()))
    return res.status(409).json({ error: "An account with this email already exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: nextId(db.data.users), name: name.trim(), email: email.trim().toLowerCase(), password: hash, created_at: now() };
  db.data.users.push(user);
  db.data.notes.push({ id: nextId(db.data.notes), user_id: user.id, title: "Welcome to SyncNote 👋", content: "This is your first note! Edit or delete it anytime.\n\nTry the AI chat button in the bottom right corner.", created_at: now(), updated_at: now() });
  await db.write();
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  await db.read();
  const user = db.data.users.find(u => u.email === email.trim().toLowerCase());
  if (!user) return res.status(401).json({ error: "No account found with this email" });
  if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: "Incorrect password" });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/me", auth, async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.get("/api/notes", auth, async (req, res) => {
  await db.read();
  res.json(db.data.notes.filter(n => n.user_id === req.user.id).sort((a, b) => b.updated_at - a.updated_at));
});

app.post("/api/notes", auth, async (req, res) => {
  const { title = "Untitled", content = "" } = req.body;
  await db.read();
  const note = { id: nextId(db.data.notes), user_id: req.user.id, title, content, created_at: now(), updated_at: now() };
  db.data.notes.push(note);
  await db.write();
  res.json(note);
});

app.put("/api/notes/:id", auth, async (req, res) => {
  await db.read();
  const note = db.data.notes.find(n => n.id === Number(req.params.id) && n.user_id === req.user.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  if (req.body.title !== undefined) note.title = req.body.title;
  if (req.body.content !== undefined) note.content = req.body.content;
  note.updated_at = now();
  await db.write();
  res.json(note);
});

app.delete("/api/notes/:id", auth, async (req, res) => {
  await db.read();
  const idx = db.data.notes.findIndex(n => n.id === Number(req.params.id) && n.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });
  db.data.notes.splice(idx, 1);
  await db.write();
  res.json({ ok: true });
});

app.post("/api/chat", auth, async (req, res) => {
  const { messages, notesContext } = req.body;
  if (!GROQ_KEY) return res.status(503).json({ error: "AI not configured — add GROQ_API_KEY to server/.env" });
  try {
    const history = messages.slice(0, -1).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const lastMsg = messages[messages.length - 1];
    const groqMessages = [
      { role: "system", content: "You are SyncNote AI - helpful and friendly. User notes: " + (notesContext || "(none)") },
      ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
    ];
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: groqMessages, max_tokens: 1024 })
    });
    const data = await groqRes.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices?.[0]?.message?.content || "No response." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/title", auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.json({ title: "Untitled" });
  if (!GROQ_KEY) return res.json({ title: content.trim().slice(0, 60) });
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Generate a short, concise title (max 6 words) for the following note. Reply with ONLY the title, no quotes, no punctuation at the end." },
          { role: "user", content: content.slice(0, 500) }
        ],
        max_tokens: 20, temperature: 0.5
      })
    });
    const data = await groqRes.json();
    const title = data.choices?.[0]?.message?.content?.trim() || content.trim().slice(0, 60);
    res.json({ title });
  } catch { res.json({ title: content.trim().slice(0, 60) }); }
});

app.post("/api/title", auth, async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.json({ title: "Untitled" });
  if (!GROQ_KEY) return res.json({ title: content.trim().slice(0, 60) });
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Generate a short, concise title (max 6 words) for the following note. Reply with ONLY the title, no quotes, no punctuation at the end." },
          { role: "user", content: content.slice(0, 500) }
        ],
        max_tokens: 20, temperature: 0.5
      })
    });
    const data = await groqRes.json();
    const title = data.choices?.[0]?.message?.content?.trim() || content.trim().slice(0, 60);
    res.json({ title });
  } catch { res.json({ title: content.trim().slice(0, 60) }); }
});

app.get("*", (req, res) => {
  const index = join(distPath, "index.html");
  if (fs.existsSync(index)) res.sendFile(index);
  else res.send("SyncNote API running. Open http://localhost:5173");
});

app.listen(PORT, () => {
  console.log(`\n✅ SyncNote server → http://localhost:${PORT}`);
  console.log(`📦 Database: ${dbFile}`);
  console.log(`🤖 AI: ${GROQ_KEY ? "Groq connected ✓" : "⚠ No GROQ_API_KEY set"}\n`);
});
