import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const features = [
  {
    description:
      "See every opportunity, status, and next action in one calm workspace instead of scattered tabs.",
    eyebrow: "Stay oriented",
    title: "One view for every application",
  },
  {
    description:
      "Keep role-specific resumes, cover letters, notes, and links attached to the right opportunity.",
    eyebrow: "Keep context",
    title: "Materials that stay organized",
  },
  {
    description:
      "Turn important dates and conversations into simple reminders so promising leads do not go quiet.",
    eyebrow: "Follow through",
    title: "Next steps you can trust",
  },
  {
    description:
      "Understand where your search is moving, where it stalls, and what deserves your attention next.",
    eyebrow: "Learn and adjust",
    title: "Progress without guesswork",
  },
];

export function Features() {
  return (
    <Section className="bg-surface" id="features" spacing="spacious">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Everything in its place</p>
          <h2 className="section-title mx-auto mt-4">
            Less searching for details. More thoughtful applications.
          </h2>
          <p className="lead mx-auto mt-6 max-w-2xl">
            Autoapply gives your job search enough structure to stay useful
            without turning it into another complicated project.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {features.map((feature, index) => (
            <article
              className="group overflow-hidden rounded-card border border-line bg-canvas"
              key={feature.title}
            >
              <div className="p-6 sm:p-8">
                <p className="eyebrow">
                  {String(index + 1).padStart(2, "0")} - {feature.eyebrow}
                </p>
                <h3 className="mt-4 max-w-md text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="body-copy mt-3 max-w-lg">
                  {feature.description}
                </p>
              </div>

              <FeaturePreview feature={index} />
            </article>
          ))}
        </div>
      </PageContainer>
    </Section>
  );
}

type FeaturePreviewProps = {
  feature: number;
};

function FeaturePreview({ feature }: FeaturePreviewProps) {
  return (
    <div
      aria-hidden="true"
      className="mx-4 mb-4 min-h-56 overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card sm:mx-6 sm:mb-6 sm:p-5"
    >
      {feature === 0 && <TrackingPreview />}
      {feature === 1 && <DocumentsPreview />}
      {feature === 2 && <ReminderPreview />}
      {feature === 3 && <InsightsPreview />}
    </div>
  );
}

function TrackingPreview() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold text-ink">Applications</p>
          <p className="mt-1 text-[0.65rem] text-ink-muted">12 active roles</p>
        </div>
        <span className="rounded-full bg-brand-900 px-3 py-1.5 text-[0.65rem] font-semibold text-white">
          Add role
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {[
          ["Juniper Studio", "Interview"],
          ["Field Notes", "Applied"],
          ["Northline", "Preparing"],
        ].map(([company, status], index) => (
          <div
            className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg bg-canvas px-3 py-3"
            key={company}
          >
            <div className="flex items-center gap-3">
              <span
                className={`size-7 rounded-md ${
                  index === 0 ? "bg-brand-300" : "bg-surface-muted"
                }`}
              />
              <span className="text-xs font-semibold">{company}</span>
            </div>
            <span className="text-[0.65rem] text-ink-muted">{status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function DocumentsPreview() {
  return (
    <div className="grid h-full gap-3 sm:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-lg bg-brand-950 p-4 text-white">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-brand-300">
          Role folder
        </p>
        <p className="mt-3 text-sm font-semibold">Product Designer</p>
        <div className="mt-5 space-y-2 text-[0.65rem] text-white/60">
          <p>Resume</p>
          <p>Cover letter</p>
          <p>Research notes</p>
        </div>
      </div>
      <div className="space-y-2">
        {["Product resume.pdf", "Role notes.txt", "Portfolio links"].map(
          (document, index) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-line p-3"
              key={document}
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-brand-100 text-[0.65rem] font-bold text-brand-800">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-semibold">{document}</p>
                <p className="mt-1 text-[0.65rem] text-ink-muted">
                  Updated today
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function ReminderPreview() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-900 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
            Today
          </span>
          <span className="text-[0.65rem] text-brand-800">9:30 AM</span>
        </div>
        <p className="mt-5 text-sm font-semibold">Send interview thank-you</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Follow up with Maya after the product design conversation.
        </p>
        <div className="mt-5 flex gap-2">
          <span className="rounded-full bg-brand-900 px-3 py-1.5 text-[0.65rem] font-semibold text-white">
            Complete
          </span>
          <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-[0.65rem] font-semibold">
            Reschedule
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightsPreview() {
  const bars = [42, 68, 50, 82, 61, 92];

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-muted">
            Search activity
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            8 responses
          </p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1.5 text-[0.65rem] font-semibold text-brand-800">
          +24% this month
        </span>
      </div>
      <div className="mt-6 flex h-28 items-end gap-3">
        {bars.map((height, index) => (
          <div
            className="flex-1 rounded-t-md bg-brand-200"
            key={`${height}-${index}`}
            style={{ height: `${height}%` }}
          >
            <div
              className="h-2/5 rounded-t-md bg-brand-700"
              style={{ minHeight: "0.5rem" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
