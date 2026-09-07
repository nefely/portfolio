import HeroSection from "./components/hero";
import StatsSection from "./components/stats";
import CapabilitiesSection from "./components/capabilities";
import ProcessSection from "./components/process";
import TestimonialsSection from "./components/testimonials";
import FaqSection from "./components/faq";
import CtaSection from "./components/cta";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CapabilitiesSection />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
