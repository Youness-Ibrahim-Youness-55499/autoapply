import { Header } from "./components/layout/Header";
import { Faq } from "./components/sections/Faq";
import { Features } from "./components/sections/Features";
import { FinalCta } from "./components/sections/FinalCta";
import { Hero } from "./components/sections/Hero";
import { HowItWorks } from "./components/sections/HowItWorks";
import { Pricing } from "./components/sections/Pricing";
import { TrustStrip } from "./components/sections/TrustStrip";

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
    </>
  );
}
