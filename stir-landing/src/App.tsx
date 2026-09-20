import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { AvatarMarquee } from './components/AvatarMarquee'
import { DashboardShowcase } from './components/DashboardShowcase'
import { Testimonials } from './components/Testimonials'
import { WelcomeBanner } from './components/WelcomeBanner'
import { HomeFeature } from './components/HomeFeature'
import { PayFeature } from './components/PayFeature'
import { SplitsFeature } from './components/SplitsFeature'
import { CollectivesFeature } from './components/CollectivesFeature'
import { TeamCards } from './components/TeamCards'
import { Security } from './components/Security'
import { CtaCards } from './components/CtaCards'
import { Drops } from './components/Drops'
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="overflow-x-hidden">
      <Nav />
      <Hero />
      <AvatarMarquee />
      <DashboardShowcase />
      <Testimonials />
      <WelcomeBanner />
      <HomeFeature />
      <PayFeature />
      <SplitsFeature />
      <CollectivesFeature />
      <TeamCards />
      <Security />
      <CtaCards />
      <Drops />
      <Footer />
    </div>
  )
}

export default App
