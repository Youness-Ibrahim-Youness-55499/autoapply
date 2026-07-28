import { Header } from "./components/layout/Header";
import { Hero } from "./components/sections/Hero";
import { TrustStrip } from "./components/sections/TrustStrip";

export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
      </main>
    </>
  );
}
