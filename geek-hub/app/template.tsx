import { FadeIn } from "@/components/motion/FadeIn";

// template (на відміну від layout) монтується заново на кожній навігації —
// тож кожна сторінка м'яко з'являється. Короткий зсув і 0.3 с: перехід
// відчувається, але не гальмує.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn y={8} duration={0.3}>
      {children}
    </FadeIn>
  );
}
