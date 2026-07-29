import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
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
      <Seo
        description="Organize opportunities, improve application materials, and keep every next step visible with Autoapply."
        title="A calmer job search workspace"
      />
      <SkipLink />
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

