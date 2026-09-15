const NOTES = [
  { title: "Q3 launch notes", meta: "Roadmap looks tight but doable · 2h ago", active: true },
  { title: "Reading list", meta: "Designing Data-Intensive Apps, ch. 4 · 1d ago", active: false },
  { title: "Grocery run", meta: "Oat milk, basil, the good coffee · 3d ago", active: false },
];

export function AppMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_8px_rgba(0,0,0,.06),0_16px_48px_rgba(0,0,0,.08)]">
      <div className="flex h-[420px]">
        {/* Sidebar */}
        <div className="hidden w-56 shrink-0 flex-col border-r border-[var(--border)] sm:flex">
          <div className="border-b border-[var(--border)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-sm text-white">
                ✎
              </div>
              <span className="font-serif-display text-lg">SyncNote</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-medium text-white">
              <span>+</span> New note
            </div>
          </div>
          <div className="flex-1 space-y-1 overflow-hidden p-2">
            {NOTES.map((n) => (
              <div
                key={n.title}
                className={`rounded-lg px-2.5 py-2 ${
                  n.active
                    ? "border border-[#b7dfc8] bg-[var(--accent-soft)]"
                    : "border border-transparent"
                }`}
              >
                <div
                  className={`truncate text-[13px] font-medium ${
                    n.active ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                  }`}
                >
                  {n.title}
                </div>
                <div className="truncate text-[11px] text-[var(--faint)]">{n.meta}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 border-t border-[var(--border)] p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">Akshat</div>
              <div className="truncate text-[11px] text-[var(--faint)]">akshat@syncnote.app</div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="relative flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3.5">
            <span className="font-serif-display text-xl">Q3 launch notes</span>
          </div>
          <div className="flex gap-1 border-b border-[var(--border)] bg-[var(--background)] px-5 py-1.5 text-[13px] text-[var(--muted)]">
            <span className="rounded px-2 py-1 font-semibold">B</span>
            <span className="rounded px-2 py-1 italic">I</span>
            <span className="rounded px-2 py-1">H1</span>
            <span className="rounded px-2 py-1">• List</span>
          </div>
          <div className="flex-1 space-y-2 px-6 py-5 text-[14px] leading-relaxed text-[var(--muted)]">
            <p>
              Roadmap looks tight but doable if design freezes by Friday. Three things to
              confirm before standup:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Waitlist copy — final review from Priya</li>
              <li>Analytics events for the new onboarding flow</li>
              <li>Ask infra about the staging DB migration window</li>
            </ul>
          </div>
          <div className="flex gap-4 border-t border-[var(--border)] px-5 py-1.5 text-[11px] text-[var(--faint)]">
            <span className="text-[var(--accent-strong)]">✓ Saved</span>
            <span>58 words</span>
            <span>Updated 2h ago</span>
          </div>

          {/* AI chat panel */}
          <div className="absolute bottom-4 right-4 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_32px_rgba(0,0,0,.14)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm">
                ✦
              </div>
              <div>
                <div className="text-[13px] font-semibold">SyncNote AI</div>
                <div className="text-[10px] text-[var(--faint)]">3 notes in context</div>
              </div>
            </div>
            <div className="space-y-2 px-3 py-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--accent)] px-3 py-1.5 text-[12px] text-white">
                what should I follow up on?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[var(--background)] px-3 py-1.5 text-[12px]">
                Chase Priya on the waitlist copy — it&apos;s the only open item blocking
                Friday&apos;s freeze.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
