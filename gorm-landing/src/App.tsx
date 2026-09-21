import Header from "./components/Header"
import Hero from "./components/Hero"
import AboutStudio from "./components/AboutStudio"
import ClientLogos from "./components/ClientLogos"
import OurWork from "./components/OurWork"
import Experiences from "./components/Experiences"
import Testimonials from "./components/Testimonials"
import Skills from "./components/Skills"
import FunFacts from "./components/FunFacts"
import ContactSection from "./components/ContactSection"
import Blog from "./components/Blog"
import MarqueeCTA from "./components/MarqueeCTA"
import Footer from "./components/Footer"

function App() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Header />
      <Hero />
      <AboutStudio />
      <ClientLogos />
      <OurWork />
      <Experiences />
      <Testimonials />
      <Skills />
      <FunFacts />
      <ContactSection />
      <Blog />
      <MarqueeCTA />
      <Footer />
    </div>
  )
}

export default App
