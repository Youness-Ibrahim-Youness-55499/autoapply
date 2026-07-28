import { Header } from "./components/layout/Header";
import { Hero } from "./components/sections/Hero";
import { HowItWorks } from "./components/sections/HowItWorks";
import { TrustStrip } from "./components/sections/TrustStrip";

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
      </main>
    </>
  );
}
