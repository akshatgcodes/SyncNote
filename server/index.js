import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "syncnote-dev-secret";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MONGO_URI = process.env.MONGO_URI || "";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) }
});

const noteSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  title: { type: String, default: "Untitled" },
  content: { type: String, default: "" },
  created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  updated_at: { type: Number, default: () => Math.floor(Date.now() / 1000) }
});

const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);

if (MONGO_URI) {
  await mongoose.connect(MONGO_URI);
  console.log("📦 MongoDB connected ✓");
}

const now = () => Math.floor(Date.now() / 1000);

app.use(cors({
  origin: ["https://syncnote2.vercel.app", "http://localhost:5173", "http://localhost:3001"],
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
  try {
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ error: "An account with this email already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: hash });
    await Note.create({ user_id: user._id, title: "Welcome to SyncNote 👋", content: "This is your first note! Edit or delete it anytime." });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ error: "No account found with this email" });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: "Incorrect password" });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/notes", auth, async (req, res) => {
  try {
    const notes = await Note.find({ user_id: req.user.id }).sort({ updated_at: -1 });
    res.json(notes.map(n => ({ id: n._id, user_id: n.user_id, title: n.title, content: n.content, created_at: n.created_at, updated_at: n.updated_at })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/notes", auth, async (req, res) => {
  try {
    const { title = "Untitled", content = "" } = req.body;
    const note = await Note.create({ user_id: req.user.id, title, content });
    res.json({ id: note._id, user_id: note.user_id, title: note.title, content: note.content, created_at: note.created_at, updated_at: note.updated_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    note.updated_at = now();
    await note.save();
    res.json({ id: note._id, user_id: note.user_id, title: note.title, content: note.content, created_at: note.created_at, updated_at: note.updated_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/chat", auth, async (req, res) => {
  const { messages, notesContext } = req.body;
  if (!GROQ_KEY) return res.status(503).json({ error: "AI not configured" });
  try {
    const groqMessages = [
      { role: "system", content: "You are SyncNote AI - helpful and friendly. User notes: " + (notesContext || "(none)") },
      ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))
    ];
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },
      body: JSON.stringify({ model: GROQ_MODEL, messages: groqMessages, max_tokens: 2048, temperature: 0.7, reasoning_effort: "low" })
    });
    const data = await groqRes.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices?.[0]?.message?.content || "No response." });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "Generate a short, concise title (max 6 words) for the following note. Reply with ONLY the title, no quotes, no punctuation at the end." },
          { role: "user", content: content.slice(0, 500) }
        ],
        // Reasoning models spend tokens thinking before the title, so leave headroom.
        max_tokens: 256, temperature: 0.5, reasoning_effort: "low"
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
  console.log("\n✅ SyncNote server → http://localhost:" + PORT);
  console.log("🤖 AI: " + (GROQ_KEY ? "Groq connected ✓" : "⚠ No GROQ_API_KEY set") + "\n");
});
