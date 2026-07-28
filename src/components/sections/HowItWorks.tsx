import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const workflowSteps = [
  {
    description:
      "Capture the role, company, source link, and deadline before details get lost across tabs.",
    label: "Collect",
    title: "Save the opportunity",
  },
  {
    description:
      "Keep the right resume, notes, and supporting materials beside the application they belong to.",
    label: "Prepare",
    title: "Tailor your materials",
  },
  {
    description:
      "Move each application through a simple status flow and always know what changed.",
    label: "Track",
    title: "Follow every stage",
  },
  {
    description:
      "Turn interviews, thank-you notes, and recruiter check-ins into clear next actions.",
    label: "Continue",
    title: "Plan the follow-up",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" spacing="spacious">
      <PageContainer>
        <div className="grid gap-8 border-b border-line pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:items-end">
          <div>
            <p className="eyebrow">A focused workflow</p>
            <h2 className="section-title mt-4">
              Four stages. One clear place to work.
            </h2>
          </div>
          <p className="lead max-w-xl lg:justify-self-end">
            Autoapply helps you turn scattered job-search activity into a
            repeatable process you can understand at a glance.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {workflowSteps.map((step, index) => (
            <li
              className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
              key={step.label}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="eyebrow">
                    {String(index + 1).padStart(2, "0")} - {step.label}
                  </p>
                  <span className="text-xs font-semibold text-ink-muted">
                    Step {index + 1} of {workflowSteps.length}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  {step.title}
                </h3>
                <p className="body-copy mt-3 max-w-lg">{step.description}</p>
              </div>

              <WorkflowPreview step={index} />
            </li>
          ))}
        </ol>
      </PageContainer>
    </Section>
  );
}

type WorkflowPreviewProps = {
  step: number;
};

function WorkflowPreview({ step }: WorkflowPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className="min-h-52 border-t border-line bg-brand-950 p-5 text-white sm:p-6"
    >
      {step === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-brand-300">New opportunity</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <PreviewField label="Company" value="Juniper Studio" />
            <PreviewField label="Role" value="Product Designer" />
            <PreviewField label="Source" value="Company careers" />
            <PreviewField label="Deadline" value="Friday" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <PreviewDocument name="Product resume" status="Ready" />
          <PreviewDocument name="Portfolio notes" status="Review" />
          <PreviewDocument name="Cover letter" status="Draft" />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-3 gap-2">
          {["Saved", "Applied", "Interview"].map((status, statusIndex) => (
            <div
              className="rounded-lg border border-white/10 bg-white/5 p-3"
              key={status}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/50">
                {status}
              </p>
              <div
                className={`mt-4 rounded-md p-3 text-xs font-semibold ${
                  statusIndex === 2
                    ? "bg-brand-300 text-brand-950"
                    : "bg-white/10"
                }`}
              >
                Design role
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <PreviewTask date="Today" label="Send interview thank-you" />
          <PreviewTask date="Thu" label="Check in with recruiter" />
          <PreviewTask date="Mon" label="Prepare portfolio examples" />
        </div>
      )}
    </div>
  );
}

type PreviewFieldProps = {
  label: string;
  value: string;
};

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div className="rounded-lg bg-white/8 p-3">
      <p className="text-[0.65rem] text-white/45">{label}</p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}

type PreviewDocumentProps = {
  name: string;
  status: string;
};

function PreviewDocument({ name, status }: PreviewDocumentProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-md bg-brand-300 text-xs font-bold text-brand-950">
          A
        </span>
        <span className="text-xs font-semibold">{name}</span>
      </div>
      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] text-white/70">
        {status}
      </span>
    </div>
  );
}

type PreviewTaskProps = {
  date: string;
  label: string;
};

function PreviewTask({ date, label }: PreviewTaskProps) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span className="w-10 text-[0.65rem] font-semibold uppercase tracking-wider text-brand-300">
        {date}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
