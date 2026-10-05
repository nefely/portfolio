export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_20%,oklch(0.77_0.13_220/0.16),transparent)]"
      />
      <div className="relative w-full max-w-sm rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur sm:p-8">
        {children}
      </div>
    </div>
  );
}
