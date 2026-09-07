import Image from "next/image";
import { RevealGroup, RevealItem } from "./motion/reveal";

// Placeholder team — swap in the real roster when ready.
const TEAM = [
  { name: "Alex Kane", role: "Founder & CEO", image: "/AK.webp" },
  { name: "Maya Chen", role: "Head of Paid Media", image: "/MC.webp" },
  { name: "Jordan Blake", role: "Creative Director", image: "/JB.webp" },
  { name: "Priya Nair", role: "Growth Engineer", image: "/PN.webp" },
  { name: "Sam Rivera", role: "Account Lead", image: "/SR.webp" },
  { name: "Leo Novak", role: "Senior Media Buyer", image: "/LN.webp" },
];

export function TeamGrid() {
  return (
    <RevealGroup className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
      {TEAM.map((member) => (
        <RevealItem
          key={member.name}
          className="rounded-2xl border border-white/10 bg-white/3 p-8 text-center transition-colors hover:border-violet-400/40"
        >
          <Image
            src={member.image}
            alt={member.name}
            width={64}
            height={64}
            className="mx-auto h-16 w-16 rounded-full object-cover"
          />
          <p className="mt-4 font-semibold text-white">{member.name}</p>
          <p className="mt-1 text-sm text-neutral-400">{member.role}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
