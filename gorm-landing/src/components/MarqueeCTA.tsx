const ITEMS = ["Let's talk", "Contact us"]

function MarqueeCTA() {
  // repeat enough times that one full width-worth of items always
  // covers the viewport, then duplicate the whole track for a seamless loop
  const track = Array.from({ length: 8 }, () => ITEMS).flat()

  return (
    <div className="overflow-hidden border-y border-white/15 bg-red py-5">
      <div className="flex w-max animate-[marquee_22s_linear_infinite] whitespace-nowrap">
        {[track, track].map((group, groupIndex) => (
          <div key={groupIndex} className="flex shrink-0 items-center">
            {group.map((item, i) => (
              <span
                key={`${groupIndex}-${i}`}
                className="flex items-center text-3xl font-semibold uppercase tracking-tight text-white lg:text-5xl"
              >
                {item}
                <span className="mx-8 text-white/60">—</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarqueeCTA
