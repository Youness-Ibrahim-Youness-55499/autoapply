import { Seo } from "../components/Seo";
import { SkipLink } from "../components/SkipLink";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { Faq } from "../components/sections/Faq";
import { Hero } from "../components/sections/Hero";
import { Pricing } from "../components/sections/Pricing";
import { ScrollProcessShowcase } from "../components/sections/ScrollProcessShowcase";

export function LandingPage() {
  return (
    <div id="top">
      <Seo
        description="Organize opportunities, improve application materials, and keep every next step visible with Jobman."
        title="A calmer job search workspace"
      />
      <SkipLink />
      <Header />
      <main id="main-content">
        <Hero />
        <ScrollProcessShowcase />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

