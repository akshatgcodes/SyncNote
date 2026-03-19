import { useState, useEffect, useRef, useCallback } from "react";

/* ─── API helper ──────────────────────────────────────────────────────────── */
const API = "";  // Vite proxies /api → localhost:3001

async function apiFetch(path, options = {}, token = null) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

/* ─── Token storage ───────────────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("sn_token");
const setToken = (t) => t ? localStorage.setItem("sn_token", t) : localStorage.removeItem("sn_token");

/* ─── Format date ─────────────────────────────────────────────────────────── */
function timeAgo(unixSecs) {
  const diff = Math.floor(Date.now() / 1000) - unixSecs;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #FAFAF8;
    --surface:  #FFFFFF;
    --border:   #E8E5DF;
    --border2:  #D4D0C8;
    --text:     #1A1814;
    --text2:    #6B6760;
    --text3:    #A09C96;
    --accent:   #2D6A4F;
    --accent2:  #40916C;
    --accent-bg:#EDF5F0;
    --red:      #DC2626;
    --red-bg:   #FEF2F2;
    --shadow:   0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
    --shadow2:  0 2px 8px rgba(0,0,0,.08), 0 8px 32px rgba(0,0,0,.06);
    --radius:   12px;
    --radius2:  8px;
  }

  html, body, #root {
    height: 100%;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  button { font-family: inherit; cursor: pointer; }
  input, textarea { font-family: inherit; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* Auth page */
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #F0F4F1 0%, #FAF8F5 50%, #F0EDE8 100%);
  }
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px;
    box-shadow: var(--shadow2);
  }
  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }
  .auth-logo-icon {
    width: 40px; height: 40px;
    background: var(--accent);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
  }
  .auth-logo-text {
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    color: var(--text);
  }
  .auth-title { font-family: 'Instrument Serif', serif; font-size: 26px; margin-bottom: 6px; }
  .auth-sub { color: var(--text2); font-size: 14px; margin-bottom: 28px; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }
  .field input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius2);
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
    outline: none;
    transition: border-color .15s;
  }
  .field input:focus { border-color: var(--accent); background: white; }
  .btn-primary {
    width: 100%;
    padding: 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius2);
    font-size: 15px;
    font-weight: 500;
    transition: background .15s, transform .1s;
  }
  .btn-primary:hover { background: var(--accent2); }
  .btn-primary:active { transform: scale(.99); }
  .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text2); }
  .auth-switch button { background: none; border: none; color: var(--accent); font-size: 14px; font-weight: 500; text-decoration: underline; }
  .error-box {
    background: var(--red-bg);
    border: 1px solid #FECACA;
    border-radius: var(--radius2);
    color: var(--red);
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* App layout */
  .app { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar {
    width: 260px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sidebar-header {
    padding: 20px 16px 16px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  }
  .sidebar-logo-icon {
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 14px; flex-shrink: 0;
  }
  .sidebar-logo-name {
    font-family: 'Instrument Serif', serif;
    font-size: 18px;
  }
  .btn-new-note {
    width: 100%;
    padding: 9px 14px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius2);
    font-size: 14px;
    font-weight: 500;
    display: flex; align-items: center; gap: 6px;
    justify-content: center;
    transition: background .15s;
  }
  .btn-new-note:hover { background: var(--accent2); }
  .sidebar-section { padding: 12px 8px 4px; }
  .sidebar-section-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text3);
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 4px;
  }
  .notes-list { flex: 1; overflow-y: auto; padding: 0 8px 16px; }
  .note-item {
    padding: 10px 10px;
    border-radius: var(--radius2);
    cursor: pointer;
    transition: background .12s;
    border: 1.5px solid transparent;
    margin-bottom: 2px;
  }
  .note-item:hover { background: var(--bg); }
  .note-item.active { background: var(--accent-bg); border-color: #B7DFC8; }
  .note-item-title { font-size: 13px; font-weight: 500; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 3px; }
  .note-item-meta { font-size: 11px; color: var(--text3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .note-item.active .note-item-title { color: var(--accent); }
  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .user-avatar {
    width: 32px; height: 32px;
    background: var(--accent-bg);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: var(--accent);
    flex-shrink: 0;
  }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-email { font-size: 11px; color: var(--text3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn-logout { background: none; border: none; color: var(--text3); font-size: 18px; padding: 2px 4px; border-radius: 6px; transition: color .15s, background .15s; flex-shrink: 0; }
  .btn-logout:hover { color: var(--red); background: var(--red-bg); }

  /* Main area */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .empty-state {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--text3); gap: 12px; padding: 40px;
    text-align: center;
  }
  .empty-icon { font-size: 48px; margin-bottom: 4px; }
  .empty-title { font-family: 'Instrument Serif', serif; font-size: 22px; color: var(--text2); }
  .empty-sub { font-size: 14px; max-width: 280px; line-height: 1.5; }

  /* Note editor */
  .editor-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .editor-topbar {
    padding: 14px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    flex-shrink: 0;
  }
  .editor-title-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: 'Instrument Serif', serif;
    font-size: 22px;
    color: var(--text);
    background: transparent;
  }
  .editor-title-input::placeholder { color: var(--text3); }
  .btn-icon {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius2);
    color: var(--text2);
    padding: 6px 10px;
    font-size: 13px;
    display: flex; align-items: center; gap: 5px;
    transition: all .15s;
    white-space: nowrap;
  }
  .btn-icon:hover { border-color: var(--border2); color: var(--text); background: var(--bg); }
  .btn-icon.danger:hover { border-color: #FECACA; color: var(--red); background: var(--red-bg); }
  .editor-toolbar {
    padding: 8px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; gap: 2px; flex-wrap: wrap;
    background: var(--bg);
    flex-shrink: 0;
  }
  .toolbar-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    background: none;
    color: var(--text2);
    font-size: 13px;
    font-weight: 500;
    transition: all .12s;
  }
  .toolbar-btn:hover { background: var(--border); color: var(--text); }
  .editor-body { flex: 1; overflow-y: auto; padding: 28px 32px; }
  .editor-content {
    min-height: 100%;
    outline: none;
    font-size: 15px;
    line-height: 1.8;
    color: var(--text2);
    max-width: 680px;
    caret-color: var(--accent);
  }
  .editor-content h1, .editor-content h2 { font-family: 'Instrument Serif', serif; color: var(--text); }
  .editor-content h1 { font-size: 26px; margin: 20px 0 10px; }
  .editor-content h2 { font-size: 20px; margin: 16px 0 8px; }
  .editor-content p { margin-bottom: 10px; }
  .editor-content ul, .editor-content ol { padding-left: 20px; margin-bottom: 10px; }
  .editor-content li { margin-bottom: 4px; }
  .editor-content strong { color: var(--text); }
  .editor-content a { color: var(--accent); }
  .editor-content pre { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; font-size: 13px; overflow-x: auto; margin: 10px 0; }
  .editor-status {
    padding: 6px 24px;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--text3);
    display: flex; gap: 16px;
    background: var(--bg);
    flex-shrink: 0;
  }
  .status-saved { color: var(--accent2); }

  /* AI Chat */
  .chat-fab {
    position: fixed;
    bottom: 24px; right: 24px;
    width: 52px; height: 52px;
    background: var(--accent);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 22px;
    box-shadow: 0 4px 16px rgba(45,106,79,.4);
    display: flex; align-items: center; justify-content: center;
    transition: transform .2s, box-shadow .2s;
    z-index: 100;
  }
  .chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(45,106,79,.5); }
  .chat-panel {
    position: fixed;
    bottom: 88px; right: 24px;
    width: 360px;
    height: 500px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow2);
    display: flex; flex-direction: column;
    overflow: hidden;
    z-index: 100;
    animation: chatUp .2s ease;
  }
  @keyframes chatUp { from { opacity: 0; transform: translateY(12px) scale(.97); } to { opacity: 1; transform: none; } }
  .chat-header {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    flex-shrink: 0;
  }
  .chat-avatar {
    width: 34px; height: 34px;
    background: var(--accent-bg);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .chat-title { font-weight: 600; font-size: 14px; }
  .chat-sub { font-size: 11px; color: var(--text3); }
  .btn-close { background: none; border: none; color: var(--text3); font-size: 20px; padding: 2px; margin-left: auto; border-radius: 6px; transition: color .15s; }
  .btn-close:hover { color: var(--text); }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .chat-msg { display: flex; gap: 8px; animation: fadeIn .2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.55;
  }
  .chat-msg.ai .chat-bubble { background: var(--bg); color: var(--text); border-bottom-left-radius: 4px; }
  .chat-msg.user .chat-bubble { background: var(--accent); color: white; border-bottom-right-radius: 4px; }
  .chat-chips { padding: 0 16px 8px; display: flex; gap: 6px; flex-wrap: wrap; }
  .chip {
    padding: 5px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: var(--text2);
    background: var(--bg);
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
  }
  .chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
  .chat-input-row {
    padding: 12px 14px;
    border-top: 1px solid var(--border);
    display: flex; gap: 8px;
    flex-shrink: 0;
  }
  .chat-input {
    flex: 1;
    border: 1.5px solid var(--border);
    border-radius: 22px;
    padding: 9px 14px;
    font-size: 13px;
    outline: none;
    background: var(--bg);
    transition: border-color .15s;
    resize: none;
    max-height: 80px;
    overflow-y: auto;
  }
  .chat-input:focus { border-color: var(--accent); background: white; }
  .btn-send {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    color: white;
    font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    align-self: flex-end;
    transition: background .15s;
  }
  .btn-send:hover { background: var(--accent2); }
  .btn-send:disabled { opacity: .5; cursor: not-allowed; }
  .typing-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--text3);
    animation: blink 1.2s infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: .2s; }
  .typing-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--text); color: white;
    padding: 10px 18px; border-radius: 22px;
    font-size: 13px; font-weight: 500;
    box-shadow: var(--shadow2);
    z-index: 999;
    animation: toastIn .2s ease;
    white-space: nowrap;
  }
  .toast.error { background: var(--red); }
  @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

  /* Loading */
  .loading-screen {
    height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--text2);
  }

  /* No notes empty */
  .no-notes { padding: 20px 8px; text-align: center; color: var(--text3); font-size: 13px; line-height: 1.5; }
`;

/* ─── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className={`toast${type === "error" ? " error" : ""}`}>{msg}</div>;
}

/* ─── Auth Screen ─────────────────────────────────────────────────────────── */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const body = mode === "register" ? { name, email, password } : { email, password };
      const data = await apiFetch(`/api/${mode}`, { method: "POST", body });
      setToken(data.token);
      onAuth(data.user);
    } catch (ex) {
      setErr(ex.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✎</div>
          <span className="auth-logo-text">SyncNote</span>
        </div>
        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</div>
        <div className="auth-sub">{mode === "login" ? "Sign in to your notes" : "Start writing today"}</div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="field">
              <label>Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" required autoFocus />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus={mode === "login"} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <div className="error-box">{err}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setErr(""); }}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AI Chat ─────────────────────────────────────────────────────────────── */
function AiChat({ notes, token }) {
  const [open, setOpen] = useState(false);
  const WELCOME = "Hi! I'm your SyncNote AI. Ask me anything about your notes, or just chat.";
  const [msgs, setMsgs] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: msg }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const notesContext = notes.map(n => `"${n.title}": ${n.content.slice(0, 300)}`).join("\n\n");
      const apiMsgs = newMsgs.filter((_, i) => !(i === 0 && newMsgs[0].role === "assistant"));
      const data = await apiFetch("/api/chat", { method: "POST", body: { messages: apiMsgs, notesContext } }, token);
      setMsgs(p => [...p, { role: "assistant", content: data.reply }]);
    } catch (ex) {
      setMsgs(p => [...p, { role: "assistant", content: `Sorry, something went wrong: ${ex.message}` }]);
    }
    setLoading(false);
  };

  const CHIPS = ["Summarize my notes", "What should I work on?", "Find key ideas"];

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="AI Assistant">
        {open ? "✕" : "✦"}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">✦</div>
            <div>
              <div className="chat-title">SyncNote AI</div>
              <div className="chat-sub">{notes.length} note{notes.length !== 1 ? "s" : ""} in context</div>
            </div>
            <button className="btn-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "user" : "ai"}`}>
                {m.role === "assistant" && <div className="chat-avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>✦</div>}
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>✦</div>
                <div className="chat-bubble">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length <= 2 && (
            <div className="chat-chips">
              {CHIPS.map(c => <button key={c} className="chip" onClick={() => send(c)}>{c}</button>)}
            </div>
          )}

          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything…"
              rows={1}
            />
            <button className="btn-send" onClick={() => send()} disabled={loading || !input.trim()}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Note Editor ─────────────────────────────────────────────────────────── */
function NoteEditor({ note, token, onSaved, onDeleted, toast }) {
  const [title, setTitle] = useState(note.title);
  const [saved, setSaved] = useState(true);
  const edRef = useRef(null);
  const saveTimer = useRef(null);
  const titleTimer = useRef(null);

  // Load content when note changes
  useEffect(() => {
    setTitle(note.title);
    if (edRef.current) edRef.current.innerHTML = note.content || "";
    setSaved(true);
  }, [note.id]);

  const schedSave = useCallback(() => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const content = edRef.current?.innerHTML || "";
        const updated = await apiFetch(`/api/notes/${note.id}`, { method: "PUT", body: { title, content } }, token);
        onSaved(updated);
        setSaved(true);
      } catch (ex) {
        toast(ex.message, "error");
      }
    }, 900);
  }, [note.id, title, token]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(async () => {
      try {
        const updated = await apiFetch(`/api/notes/${note.id}`, { method: "PUT", body: { title: e.target.value } }, token);
        onSaved(updated);
        setSaved(true);
      } catch {}
    }, 700);
  };

  const fmt = (cmd, val) => { document.execCommand(cmd, false, val); edRef.current?.focus(); schedSave(); };

  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;
    try {
      await apiFetch(`/api/notes/${note.id}`, { method: "DELETE" }, token);
      onDeleted(note.id);
      toast("Note deleted");
    } catch (ex) { toast(ex.message, "error"); }
  };

  const wordCount = (edRef.current?.innerText || "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="editor-wrap">
      <div className="editor-topbar">
        <input
          className="editor-title-input"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title…"
        />
        <button className="btn-icon danger" onClick={handleDelete}>🗑 Delete</button>
      </div>

      <div className="editor-toolbar">
        {[
          ["B", () => fmt("bold")],
          ["I", () => fmt("italic")],
          ["U", () => fmt("underline")],
          ["H1", () => fmt("formatBlock", "h1")],
          ["H2", () => fmt("formatBlock", "h2")],
          ["• List", () => fmt("insertUnorderedList")],
          ["1. List", () => fmt("insertOrderedList")],
        ].map(([label, action]) => (
          <button key={label} className="toolbar-btn" onMouseDown={e => { e.preventDefault(); action(); }}>{label}</button>
        ))}
      </div>

      <div className="editor-body">
        <div
          ref={edRef}
          className="editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={schedSave}
        />
      </div>

      <div className="editor-status">
        <span className={saved ? "status-saved" : ""}>{saved ? "✓ Saved" : "Saving…"}</span>
        <span>{wordCount} words</span>
        <span>Updated {timeAgo(note.updated_at)}</span>
      </div>
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────────── */
function MainApp({ user, token, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = "success") =>
    setToasts(p => [...p, { id: Date.now() + Math.random(), msg, type }]);

  // Load notes
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/notes", {}, token);
        setNotes(data);
        if (data.length > 0) setActiveId(data[0].id);
      } catch (ex) { toast(ex.message, "error"); }
      setLoadingNotes(false);
    })();
  }, []);

  const createNote = async () => {
    try {
      const note = await apiFetch("/api/notes", { method: "POST", body: { title: "Untitled", content: "" } }, token);
      setNotes(p => [note, ...p]);
      setActiveId(note.id);
    } catch (ex) { toast(ex.message, "error"); }
  };

  const handleSaved = (updated) => {
    setNotes(p => p.map(n => n.id === updated.id ? updated : n));
  };

  const handleDeleted = (id) => {
    setNotes(p => {
      const remaining = p.filter(n => n.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
      return remaining;
    });
  };

  const activeNote = notes.find(n => n.id === activeId) || null;

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✎</div>
            <span className="sidebar-logo-name">SyncNote</span>
          </div>
          <button className="btn-new-note" onClick={createNote}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New note
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Notes</div>
        </div>

        <div className="notes-list">
          {loadingNotes ? (
            <div className="no-notes">Loading…</div>
          ) : notes.length === 0 ? (
            <div className="no-notes">No notes yet.<br />Click "+ New note" to start.</div>
          ) : notes.map(n => (
            <div
              key={n.id}
              className={`note-item${n.id === activeId ? " active" : ""}`}
              onClick={() => setActiveId(n.id)}
            >
              <div className="note-item-title">{n.title || "Untitled"}</div>
              <div className="note-item-meta">
                {n.content ? n.content.replace(/<[^>]+>/g, "").slice(0, 45) + "…" : "Empty note"} · {timeAgo(n.updated_at)}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">{user.name[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
          <button className="btn-logout" onClick={onLogout} title="Sign out">⎋</button>
        </div>
      </div>

      {/* Main content */}
      <div className="main">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            token={token}
            onSaved={handleSaved}
            onDeleted={handleDeleted}
            toast={toast}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✎</div>
            <div className="empty-title">Nothing selected</div>
            <div className="empty-sub">
              {notes.length === 0
                ? "Create your first note using the button in the sidebar."
                : "Select a note from the sidebar to start reading or editing."}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat */}
      <AiChat notes={notes} token={token} />

      {/* Toasts */}
      {toasts.map(tk => (
        <Toast key={tk.id} msg={tk.msg} type={tk.type} onDone={() => setToasts(p => p.filter(t => t.id !== tk.id))} />
      ))}
    </div>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken);
  const [loading, setLoading] = useState(true);

  // Verify saved token on load
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch("/api/me", {}, token)
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => { setToken(null); setTokenState(null); setLoading(false); });
  }, []);

  const handleAuth = (u) => setUser(u);
  const handleLogout = () => { setToken(null); setTokenState(null); setUser(null); };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">Loading…</div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      {!user
        ? <AuthScreen onAuth={handleAuth} />
        : <MainApp user={user} token={token} onLogout={handleLogout} />
      }
    </>
  );
}
