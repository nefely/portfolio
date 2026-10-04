// Той самий знак, що й app/icon.svg — фавікон і логотип збігаються.
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={`${className} rounded-lg shadow-lg shadow-primary/25`}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0479b" />
          <stop offset="1" stopColor="#3fc1e0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-gradient)" />
      <path
        d="M43 21.5A15 15 0 1 0 47 32H33"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <LogoMark />
      <span>
        Geek<span className="text-gradient">Hub</span>
      </span>
    </span>
  );
}
