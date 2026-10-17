import { AppMockup } from "./components/AppMockup";
import { Badge } from "./components/Badge";

const FEATURES = [
  {
    title: "Autosave, always",
    body: "Every keystroke debounces into a save — title and content persist to MongoDB within a second of you stopping typing. Nothing to hit, nothing to lose.",
  },
  {
    title: "AI that reads your notes",
    body: "The chat assistant is handed your notes as context on every message, so \"what should I follow up on?\" gets an answer grounded in what you actually wrote — not a generic one.",
  },
  {
    title: "Titles you never type",
    body: "Stop writing, and a title gets generated from the first lines of content automatically — powered by the same model as chat, with a clean local fallback if AI is unavailable.",
  },
  {
    title: "Real auth, not a toy",
    body: "Email/password accounts with bcrypt-hashed passwords and JWT sessions. Your notes are scoped to your account, stored in MongoDB, and yours across devices.",
  },
];

const STACK = [
  "React",
  "Vite",
  "Express.js",
  "MongoDB",
  "Mongoose",
  "JWT",
  "bcrypt",
  "Groq · Llama 3.3 70B",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
              ✎
            </div>
            <span className="font-serif-display text-xl">SyncNote</span>
          </div>
          <nav className="hidden gap-6 text-sm text-[var(--muted)] sm:flex">
            <a href="#features" className="hover:text-[var(--foreground)]">
              Features
            </a>
            <a href="#stack" className="hover:text-[var(--foreground)]">
              Stack
            </a>
            <a href="/app/" className="hover:text-[var(--foreground)]">
              Open app
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h1 className="font-serif-display text-4xl leading-[1.1] sm:text-5xl">
              Notes with an AI that actually reads them.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
              SyncNote is a clean, fast note-taking app: register, write, and every note
              autosaves as you go. An AI assistant sits in the corner, already aware of
              everything you&apos;ve written — ask it to summarize, find ideas, or tell you
              what to work on next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/app/"
                className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
              >
                Try it live — sign up free
              </a>
              <a
                href="#run-it"
                className="rounded-lg border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--surface)]"
              >
                Run it locally
              </a>
              <a
                href="#features"
                className="rounded-lg border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium transition hover:bg-[var(--surface)]"
              >
                See what it does
              </a>
            </div>
          </div>
          <AppMockup />
        </div>
      </section>

      {/* X Factor / Features */}
      <section id="features" className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            The X Factor
          </p>
          <h2 className="mt-2 font-serif-display text-3xl">
            Not just a text box with a save button
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          Key concepts
        </p>
        <h2 className="mt-2 font-serif-display text-3xl">Built on a plain, real stack</h2>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
          A React + Vite frontend talking to a small Express API, backed by MongoDB via
          Mongoose, with JWT/bcrypt auth and Groq&apos;s Llama 3.3 70B for chat and
          auto-titling.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </section>

      {/* Run it */}
      <section id="run-it" className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Run it
          </p>
          <h2 className="mt-2 font-serif-display text-3xl">Two terminals, one app</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#14120f] text-[#d8d4cb]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5f]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf50]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
                <span className="ml-2 text-[11px] text-white/40">setup</span>
              </div>
              <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
{`$ npm run install:all
# installs both server/ and client/

$ cp server/.env.example server/.env
# set MONGO_URI, JWT_SECRET, GROQ_API_KEY`}
              </pre>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#14120f] text-[#d8d4cb]">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5f]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf50]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
                <span className="ml-2 text-[11px] text-white/40">run</span>
              </div>
              <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed">
{`$ npm run dev
# server → http://localhost:3001
# client → http://localhost:5173

open http://localhost:5173`}
              </pre>
            </div>
          </div>
          <p className="mt-6 text-xs text-[var(--faint)]">
            Requires a MongoDB connection string (local or Atlas) and, optionally, a free
            Groq API key for the AI chat and auto-titling features.
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--faint)]">
        SyncNote · Licensed under GPLv3
      </footer>
    </div>
  );
}
