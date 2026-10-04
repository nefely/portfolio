export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-primary to-[oklch(0.78_0.13_210)] text-sm font-black text-primary-foreground shadow-lg shadow-primary/25"
      >
        G
      </span>
      <span>
        Geek<span className="text-gradient">Hub</span>
      </span>
    </span>
  );
}
