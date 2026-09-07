import { Reveal } from "./motion/reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
      <Reveal>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-300 uppercase">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-neutral-400">{description}</p>
      </Reveal>
    </div>
  );
}
