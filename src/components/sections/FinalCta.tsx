import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

export function FinalCta() {
  return (
    <Section id="final-cta" spacing="spacious">
      <PageContainer>
        <div className="relative overflow-hidden rounded-card bg-brand-950 px-6 py-16 text-white shadow-card sm:px-12 sm:py-20 lg:px-20">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-32 size-96 rounded-full bg-brand-600/30 blur-3xl"
          />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">
              Your next application can feel clearer
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Build a job search you can keep moving.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Bring opportunities, materials, and follow-ups into one calm
              workflow designed around thoughtful progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-brand-950 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                to="/signup"
              >
                Start with the free plan
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-base font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                href="#how-it-works"
              >
                Review the workflow
              </a>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

