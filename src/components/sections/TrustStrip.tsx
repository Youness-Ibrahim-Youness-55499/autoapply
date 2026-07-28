import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const jobSearchContexts = [
  "Career changes",
  "First professional roles",
  "Returning to work",
  "High-volume searches",
];

export function TrustStrip() {
  return (
    <Section
      aria-labelledby="trust-strip-title"
      className="border-y border-line bg-surface"
      spacing="compact"
    >
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
          <div>
            <p className="eyebrow">Designed around real job searches</p>
            <h2
              className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.04em] sm:text-3xl"
              id="trust-strip-title"
            >
              Useful wherever you are in your career.
            </h2>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {jobSearchContexts.map((context, index) => (
              <li
                className="flex min-h-24 flex-col justify-between rounded-xl border border-line bg-canvas p-4"
                key={context}
              >
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
                >
                  {index + 1}
                </span>
                <span className="mt-5 text-sm font-semibold leading-snug">
                  {context}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </Section>
  );
}
