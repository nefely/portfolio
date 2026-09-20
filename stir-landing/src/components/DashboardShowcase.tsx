import dashboardMockup from '../assets/figma/dashboard-mockup.png'

export function DashboardShowcase() {
  return (
    <section className="relative mx-auto w-full max-w-[1199px] px-6 pb-16 lg:px-0 lg:pb-24">
      <div className="relative overflow-hidden rounded-2xl shadow-[0_-16px_64px_rgba(43,42,53,0.32)]">
        <img src={dashboardMockup} alt="Stir dashboard" className="w-full" />
      </div>
      <button
        type="button"
        className="absolute right-6 -bottom-5 rounded-full bg-ink px-6 py-2.5 text-sm text-[#ededed] shadow-[4px_0_16px_rgba(0,0,0,0.26)] lg:right-12"
      >
        Try it out
      </button>
    </section>
  )
}
