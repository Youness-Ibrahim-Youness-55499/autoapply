import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { Faq } from "../components/sections/Faq";
import { Features } from "../components/sections/Features";
import { FinalCta } from "../components/sections/FinalCta";
import { Hero } from "../components/sections/Hero";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Pricing } from "../components/sections/Pricing";
import { ScrollProcessShowcase } from "../components/sections/ScrollProcessShowcase";
import { TrustStrip } from "../components/sections/TrustStrip";

export function LandingPage() {
  return (
    <div id="top">
      <a
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-brand-950 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Features />
        <ScrollProcessShowcase />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

