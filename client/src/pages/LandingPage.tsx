import { C, ParticleCanvas, NoiseOverlay } from '@/components/landing/landingTokens'
import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import SQLTicker from '@/components/landing/SQLTicker'
import MissionPathSection from '@/components/landing/MissionPathSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import RanksSection from '@/components/landing/RanksSection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/layout/Footer'

export default function Landing() {
  return (
    <div style={{ background: C.void, minHeight: '100vh', position: 'relative' }}>
      <ParticleCanvas />
      <NoiseOverlay />
      <LandingNav />
      <HeroSection />
      <SQLTicker />
      <MissionPathSection />
      <FeaturesSection />
      <RanksSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
    </div>
  )
}
