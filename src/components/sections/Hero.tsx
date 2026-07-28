import { PageContainer } from "../layout/PageContainer";
import { Button } from "../ui/Button";
import { Section } from "../ui/Section";

const applications = [
  {
    company: "Northstar",
    role: "Product Designer",
    status: "Interview",
    tone: "bg-brand-100 text-brand-800",
  },
  {
    company: "Lattice Works",
    role: "UX Researcher",
    status: "Applied",
    tone: "bg-surface-muted text-ink-muted",
  },
  {
    company: "Bright Labs",
    role: "Design Lead",
    status: "Preparing",
    tone: "bg-amber-100 text-amber-800",
  },
];

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
            <Button size="lg">Start organizing</Button>
            <Button size="lg" variant="secondary">
              See how it works
            </Button>
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

        <div
          aria-label="Autoapply application workspace preview"
          className="relative mx-auto mt-14 max-w-6xl"
          role="img"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-16 -top-8 h-48 rounded-full bg-brand-200/50 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="relative overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-brand-300" />
                <span className="size-2.5 rounded-full bg-brand-200" />
                <span className="size-2.5 rounded-full bg-surface-muted" />
              </div>
              <div className="h-7 w-28 rounded-full bg-surface-muted sm:w-44" />
              <div className="size-7 rounded-full bg-brand-900" />
            </div>

            <div className="grid min-h-96 md:grid-cols-[12rem_1fr]">
              <aside className="hidden border-r border-line bg-brand-950 p-5 text-white md:block">
                <p className="text-sm font-bold tracking-[-0.02em]">autoapply</p>
                <div className="mt-8 space-y-2">
                  <div className="rounded-lg bg-white/12 px-3 py-2.5 text-xs font-semibold">
                    Applications
                  </div>
                  <div className="px-3 py-2.5 text-xs text-white/60">
                    Documents
                  </div>
                  <div className="px-3 py-2.5 text-xs text-white/60">
                    Tasks
                  </div>
                  <div className="px-3 py-2.5 text-xs text-white/60">
                    Insights
                  </div>
                </div>
              </aside>

              <div className="min-w-0 p-4 sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                      Application workspace
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      Good morning, Alex
                    </h2>
                  </div>
                  <div className="h-9 w-32 rounded-full bg-brand-900" />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  <Metric label="Active" value="12" />
                  <Metric label="Interviews" value="3" />
                  <Metric label="This week" value="5" />
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-line">
                  <div className="hidden grid-cols-[1.2fr_1.5fr_0.8fr] bg-surface-muted px-4 py-3 text-xs font-semibold text-ink-muted sm:grid">
                    <span>Company</span>
                    <span>Role</span>
                    <span>Status</span>
                  </div>
                  {applications.map((application) => (
                    <div
                      className="grid gap-1 border-t border-line px-4 py-4 first:border-t-0 sm:grid-cols-[1.2fr_1.5fr_0.8fr] sm:items-center"
                      key={application.company}
                    >
                      <span className="text-sm font-semibold">
                        {application.company}
                      </span>
                      <span className="text-sm text-ink-muted">
                        {application.role}
                      </span>
                      <span
                        className={`mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-semibold sm:mt-0 ${application.tone}`}
                      >
                        {application.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3 sm:p-4">
      <p className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </div>
  );
}
