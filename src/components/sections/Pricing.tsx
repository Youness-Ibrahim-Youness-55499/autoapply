import { Link } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const plans = [
  {
    description: "A simple workspace for building a focused search.",
    features: ["Track up to 20 roles", "Organize core documents", "Basic reminders"],
    name: "Starter",
    price: "$0",
  },
  {
    description: "More room and guidance for an active job search.",
    featured: true,
    features: ["Unlimited applications", "Tailored role folders", "Progress insights"],
    name: "Focused",
    price: "$12",
  },
  {
    description: "Longer-term support for complex career transitions.",
    features: ["Everything in Focused", "Advanced organization", "Priority support"],
    name: "Momentum",
    price: "$24",
  },
];

export function Pricing() {
  return (
    <Section id="pricing" spacing="spacious">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow">Simple pricing</p>
            <h2 className="section-title mt-4">
              Choose the support your search needs.
            </h2>
          </div>
          <p className="lead max-w-xl lg:justify-self-end">
            Start with the essentials, then add more structure when your search
            becomes busier.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={`flex flex-col rounded-card border p-6 sm:p-8 ${
                plan.featured
                  ? "border-brand-900 bg-brand-950 text-white shadow-card"
                  : "border-line bg-surface"
              }`}
              key={plan.name}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-full bg-brand-300 px-3 py-1 text-xs font-semibold text-brand-950">
                    Most popular
                  </span>
                )}
              </div>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  plan.featured ? "text-white/65" : "text-ink-muted"
                }`}
              >
                {plan.description}
              </p>
              <p className="mt-8 text-5xl font-semibold tracking-[-0.06em]">
                {plan.price}
                <span
                  className={`ml-2 text-sm font-medium tracking-normal ${
                    plan.featured ? "text-white/55" : "text-ink-muted"
                  }`}
                >
                  / month
                </span>
              </p>
              <ul
                className={`mt-8 flex-1 space-y-3 border-t pt-6 text-sm ${
                  plan.featured
                    ? "border-white/15 text-white/75"
                    : "border-line text-ink-muted"
                }`}
              >
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-3" key={feature}>
                    <span
                      className={`size-1.5 rounded-full ${
                        plan.featured ? "bg-brand-300" : "bg-brand-600"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-8 inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 ${
                  plan.featured
                    ? "border-white bg-white text-brand-950 hover:bg-brand-50"
                    : "border-brand-900 bg-brand-900 text-white hover:bg-brand-800"
                }`}
                to="/signup"
              >
                Choose {plan.name}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Illustrative launch pricing. Final billing terms will be confirmed
          before payments are enabled.
        </p>
      </PageContainer>
    </Section>
  );
}

