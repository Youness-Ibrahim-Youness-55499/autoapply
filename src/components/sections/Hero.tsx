import { Link } from "react-router-dom";
import dashboardHero from "../../assets/autoapply-dashboard-hero-midnight.png";
import { PageContainer } from "../layout/PageContainer";
import { ButtonLink } from "../ui/Button";
import { Section } from "../ui/Section";

export function Hero() {
  return (
    <Section className="overflow-hidden" id="get-started" spacing="hero">
      <PageContainer>
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Your job search, thoughtfully organized</p>
          <h1 className="display-title mx-auto mt-5 max-w-[14ch]">
            Make every application stronger.
          </h1>
          <p className="lead mx-auto mt-6 max-w-2xl">
            Keep opportunities, tailored materials, and next steps together so
            you can apply with confidence and follow through without the chaos.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-900 bg-brand-900 px-6 text-base font-semibold text-white shadow-button transition-colors duration-200 hover:border-brand-800 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
              to="/signup"
            >
              Start organizing
            </Link>
            <ButtonLink href="#how-it-works" size="lg" variant="secondary">
              See how it works
            </ButtonLink>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Free to get started
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Built for active job seekers
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Your progress stays clear
            </li>
          </ul>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div
            aria-hidden="true"
            className="absolute inset-x-16 -top-8 h-48 rounded-full bg-brand-200/50 blur-3xl"
          />
          <img
            alt="Autoapply dashboard showing active roles, interviews, follow-ups, and an organized application list"
            className="relative w-full rounded-card border border-line bg-surface shadow-card"
            decoding="async"
            loading="eager"
            src={dashboardHero}
          />
        </div>
      </PageContainer>
    </Section>
  );
}

