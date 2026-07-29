import { processStages } from "./ProcessTabs";

type StagePreviewProps = {
  stage: number;
};

const stageCopy = [
  {
    eyebrow: "Opportunity discovery",
    title: "The right roles come to you.",
    description: "Searches trusted sources and filters new roles around your experience, goals, and preferences.",
  },
  {
    eyebrow: "Application preparation",
    title: "Every document starts from the role.",
    description: "Reads the job description, identifies the strongest evidence, and prepares role-specific materials.",
  },
  {
    eyebrow: "Controlled submission",
    title: "Applications move only when ready.",
    description: "Keeps every field, document, and answer together so you can review the complete application before sending.",
  },
  {
    eyebrow: "Response tracking",
    title: "Every reply moves the pipeline.",
    description: "Routes recruiter messages to the right application and keeps interviews, follow-ups, and outcomes visible.",
  },
];

export function StagePreview({ stage }: StagePreviewProps) {
  const copy = stageCopy[stage];

  return (
    <article className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-card">
      <header className="grid gap-2 border-b border-line px-6 py-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-center lg:px-7">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-brand-700">
            0{stage + 1} Â· {copy.eyebrow}
          </p>
          <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
            {copy.title}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-5 text-ink-muted sm:justify-self-end">
          {copy.description}
        </p>
      </header>

      <div className="min-h-0 flex-1 p-4">
        {stage === 0 ? <FindPanel /> : null}
        {stage === 1 ? <PrepPanel /> : null}
        {stage === 2 ? <ApplyPanel /> : null}
        {stage === 3 ? <TrackPanel /> : null}
      </div>
    </article>
  );
}

export function MobileStagePreview({ stage }: StagePreviewProps) {
  return (
    <section aria-labelledby={`mobile-stage-${stage}`} className="space-y-4">
      <p className="eyebrow" id={`mobile-stage-${stage}`}>
        0{stage + 1} Â· {processStages[stage]}
      </p>
      <StagePreview stage={stage} />
    </section>
  );
}

function FindPanel() {
  const roles = [
    ["Product Designer", "Northstar", "94%"],
    ["Senior UX Designer", "Daylight", "89%"],
    ["Design Systems Lead", "Mosaic", "86%"],
  ];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/45">New opportunities</p>
            <p className="mt-1 text-3xl font-semibold leading-none tracking-[-0.05em]">24</p>
          </div>
          <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs text-brand-200">Updated now</span>
        </div>
        <div className="mt-3 min-h-0 space-y-2">
          {roles.map(([role, company, match]) => (
            <div className="grid grid-cols-[1fr_auto] items-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5" key={role}>
              <div>
                <p className="text-sm font-semibold">{role}</p>
                <p className="mt-1 text-xs text-white/42">{company}</p>
              </div>
              <span className="text-sm font-semibold text-brand-200">{match}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <MiniMetric label="Sources monitored" value="7" />
        <MiniMetric label="High-confidence matches" value="18" />
      </div>
    </div>
  );
}

function PrepPanel() {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="grid min-h-0 grid-rows-2 gap-3">
        <LightCard label="01 Â· Reads the role" title="Requirements made clear">
          <p className="rounded-xl bg-white p-3 text-sm leading-5 text-ink-muted">
            Senior product designer with <Mark>design systems</Mark>, <Mark>research</Mark>, and
            <Mark> cross-functional leadership</Mark>.
          </p>
        </LightCard>
        <LightCard label="02 Â· Selects evidence" title="Your strongest experience">
          <div className="space-y-1.5 text-sm text-ink-muted">
            <p className="rounded-lg border border-line bg-white px-3 py-1.5">Scaled a component system across 4 product teams</p>
            <p className="rounded-lg border border-line bg-white px-3 py-1.5">Improved research-to-release time by 31%</p>
          </div>
        </LightCard>
      </div>
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">Tailored document preview</p>
        <h4 className="mt-2 text-xl font-semibold">Product Designer Â· Northstar</h4>
        <div className="mt-3 min-h-0 flex-1 rounded-xl bg-white p-4 text-ink">
          <p className="text-sm font-semibold">Selected experience</p>
          <div className="mt-3 space-y-2 text-sm leading-5">
            <p className="rounded-lg bg-emerald-50 px-3 py-2">+ Built and governed a design system used by four autonomous product teams.</p>
            <p className="rounded-lg bg-emerald-50 px-3 py-2">+ Connected customer research to roadmap decisions, reducing rework by 31%.</p>
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-brand-800">12 role-specific keywords incorporated naturally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplyPanel() {
  const checks = ["Contact details verified", "Role-specific CV attached", "Cover letter reviewed", "Screening answers complete"];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">Application review</p>
            <h4 className="mt-2 text-xl font-semibold">Senior Product Designer Â· Northstar</h4>
          </div>
          <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs text-amber-100">Awaiting approval</span>
        </div>
        <div className="mt-3 grid min-h-0 flex-1 gap-2.5 sm:grid-cols-2">
          {checks.map((check) => (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3" key={check}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs text-emerald-200">âœ“</span>
              <span className="text-sm text-white/78">{check}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-xs text-white/45">Nothing is submitted without your approval.</p>
          <span className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold">Approve and submit</span>
        </div>
      </div>
      <div className="grid min-h-0 gap-4">
        <MiniMetric label="Forms completed automatically" value="18" />
        <MiniMetric label="Average review time" value="2m 14s" />
      </div>
    </div>
  );
}

function TrackPanel() {
  const pipeline = [
    ["Submitted", "18"],
    ["Viewed", "11"],
    ["Replied", "5"],
    ["Interview", "2"],
  ];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex min-h-0 flex-col rounded-2xl bg-[#11172a] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">Live pipeline</p>
            <h4 className="mt-2 text-xl font-semibold">Replies routed automatically</h4>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">2 interviews</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {pipeline.map(([label, value]) => (
            <div className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5" key={label}>
              <p className="text-[0.6875rem] text-white/42">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 min-h-0 space-y-1.5">
          <PipelineRow company="Northstar" next="Interview Â· Tue 10:30" status="Interview" />
          <PipelineRow company="Daylight" next="Reply received today" status="Replied" />
          <PipelineRow company="Mosaic" next="Follow up in 2 days" status="Viewed" />
        </div>
      </div>
      <LightCard label="Upcoming" title="Interviews this week">
        <div className="space-y-3">
          <ScheduleRow company="Northstar" time="Tue Â· 10:30" />
          <ScheduleRow company="Mosaic Labs" time="Thu Â· 14:00" />
        </div>
      </LightCard>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-0 flex-col justify-between rounded-2xl border border-line bg-canvas p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{label}</p>
      <p className="mt-4 text-4xl font-semibold leading-none tracking-[-0.05em] text-ink">{value}</p>
    </div>
  );
}

function LightCard({ children, label, title }: { children: React.ReactNode; label: string; title: string }) {
  return (
    <div className="min-h-0 overflow-hidden rounded-2xl border border-line bg-canvas p-4">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-700">{label}</p>
      <h4 className="mt-2 text-lg font-semibold text-ink">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-brand-100 px-1 text-brand-900">{children}</mark>;
}

function PipelineRow({ company, next, status }: { company: string; next: string; status: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2">
      <div>
        <p className="text-sm font-semibold">{company}</p>
        <p className="mt-1 text-xs text-white/42">{next}</p>
      </div>
      <span className="text-xs text-brand-200">{status}</span>
    </div>
  );
}

function ScheduleRow({ company, time }: { company: string; time: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-2.5">
      <p className="text-sm font-semibold text-ink">{company}</p>
      <p className="mt-1 text-xs text-ink-muted">{time}</p>
    </div>
  );
}

