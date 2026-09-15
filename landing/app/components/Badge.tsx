export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
      {children}
    </span>
  );
}
