// Decorative radar behind the home hero: rings, a rotating sweep with a fading
// trail, and blips that flash exactly when the beam passes over them.
// Pure CSS/SVG — no JS. Animations stop under prefers-reduced-motion (globals.css).

const PERIOD_S = 6;

// blip positions: angle clockwise from 12 o'clock, distance as a fraction of the radius
const BLIPS = [
  { angle: 38, r: 0.62 },
  { angle: 112, r: 0.38 },
  { angle: 168, r: 0.8 },
  { angle: 236, r: 0.52 },
  { angle: 301, r: 0.72 },
  { angle: 334, r: 0.3 },
];

export function RadarSweep() {
  return (
    <div
      aria-hidden="true"
      className="radar pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(760px,150vw)] -translate-x-1/2 -translate-y-1/2 mask-[radial-gradient(circle,black_35%,transparent_70%)]"
      style={{ "--radar-period": `${PERIOD_S}s` } as React.CSSProperties}
    >
      {/* rings + crosshair */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-accent" fill="none">
        {[25, 50, 75, 99].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeOpacity={r === 99 ? 0.22 : 0.14} strokeWidth="0.4" />
        ))}
        <path d="M100 1v198M1 100h198" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.4" />
        {/* tick marks on the outer ring every 30° */}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="1"
            x2="100"
            y2="5"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="0.5"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
      </svg>

      {/* sweep: a fading conic trail behind a bright leading edge */}
      <div className="radar-sweep absolute inset-0 rounded-full">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,color-mix(in_oklch,var(--accent)_28%,transparent)_360deg)]" />
        <div className="absolute bottom-1/2 left-1/2 h-1/2 w-px -translate-x-1/2 bg-linear-to-t from-accent/80 to-accent/0" />
      </div>

      {/* blips light up when the beam reaches their angle */}
      {BLIPS.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const x = 50 + Math.sin(rad) * b.r * 50;
        const y = 50 - Math.cos(rad) * b.r * 50;
        return (
          <span
            key={i}
            className="radar-blip absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_2px_var(--accent)]"
            // negative delay = the cycle is already running at load, so each blip is in phase
            // with the beam from the first frame (a positive delay would show the flash keyframe while waiting)
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(b.angle / 360 - 1) * PERIOD_S}s` }}
          />
        );
      })}

      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70" />
    </div>
  );
}
