import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";

type LegalPageKind = "legal-notice" | "privacy" | "terms";

type LegalPageProps = {
  kind: LegalPageKind;
};

type LegalSection = {
  content: ReactNode;
  title: string;
};

const pageContent: Record<
  LegalPageKind,
  {
    description: string;
    eyebrow: string;
    sections: LegalSection[];
    title: string;
  }
> = {
  privacy: {
    description:
      "A launch-ready structure describing how Autoapply handles personal data.",
    eyebrow: "Privacy foundation",
    sections: [
      {
        title: "1. Controller information",
        content: (
          <>
            <p>
              Before launch, replace this paragraph with the controllerâ€™s full
              legal name, postal address, email address, andâ€”if applicableâ€”the
              contact details of a data protection officer.
            </p>
            <p className="mt-3 font-semibold text-brand-800">
              Required launch detail: [legal name, address, privacy contact]
            </p>
          </>
        ),
      },
      {
        title: "2. Current preview behavior",
        content: (
          <p>
            The current frontend preview does not create accounts, submit the
            login or signup forms, process payments, or send job applications.
            Information typed into unfinished forms is not intentionally
            transmitted by the application.
          </p>
        ),
      },
      {
        title: "3. Data that will require documentation",
        content: (
          <p>
            Before authentication or automation is enabled, this notice must be
            updated with the exact account data, application documents, job
            preferences, usage information, recipients, hosting providers,
            retention periods, legal bases, and any international transfers.
          </p>
        ),
      },
      {
        title: "4. Cookies and analytics",
        content: (
          <p>
            No optional analytics or advertising cookies are intentionally
            configured in the current frontend. If analytics, support widgets,
            payment tools, or other third-party services are added, this section
            and any consent mechanism must be updated before activation.
          </p>
        ),
      },
      {
        title: "5. Your data protection rights",
        content: (
          <p>
            Depending on the circumstances, people in the EU may have rights to
            information, access, correction, deletion, restriction, portability,
            and objection, as well as the right to complain to a supervisory
            authority. The final notice must explain how those rights can be
            exercised with the actual controller.
          </p>
        ),
      },
    ],
    title: "Privacy notice",
  },
  terms: {
    description:
      "Draft terms structure for the Autoapply frontend preview and future service.",
    eyebrow: "Terms foundation",
    sections: [
      {
        title: "1. Preview status",
        content: (
          <p>
            Autoapply is currently a frontend product preview. Account creation,
            automated applications, subscriptions, and payment functionality are
            not yet available. Displayed plans and prices are illustrative.
          </p>
        ),
      },
      {
        title: "2. Future service scope",
        content: (
          <p>
            Before a public service launches, these terms must define eligibility,
            account responsibilities, permitted use, application automation,
            subscription rules, cancellation rights, availability, and the
            responsibilities retained by each job seeker.
          </p>
        ),
      },
      {
        title: "3. User responsibility",
        content: (
          <p>
            Users will remain responsible for reviewing the truthfulness,
            accuracy, and suitability of application materials before submission
            and for complying with employer and platform rules.
          </p>
        ),
      },
      {
        title: "4. No employment guarantee",
        content: (
          <p>
            Organizational or AI-assisted features cannot guarantee interviews,
            offers, employment, or a particular response from employers.
          </p>
        ),
      },
      {
        title: "5. Complete before launch",
        content: (
          <p>
            Final terms require the operatorâ€™s identity, governing-law analysis,
            consumer cancellation information where applicable, pricing and
            renewal details, liability language, and a reliable contact channel.
            These details should be reviewed by qualified legal counsel.
          </p>
        ),
      },
    ],
    title: "Terms of use",
  },
  "legal-notice": {
    description:
      "Provider-information structure for Autoapply under German digital-services rules.",
    eyebrow: "German provider information",
    sections: [
      {
        title: "Information to complete before launch",
        content: (
          <div className="space-y-3">
            <p>
              <strong>Provider:</strong> [full legal name and legal form]
            </p>
            <p>
              <strong>Address:</strong> [complete business address]
            </p>
            <p>
              <strong>Contact:</strong> [email address and direct communication
              channel]
            </p>
            <p>
              <strong>Represented by:</strong> [authorized representative, if
              applicable]
            </p>
            <p>
              <strong>Register:</strong> [register and registration number, if
              applicable]
            </p>
            <p>
              <strong>VAT ID:</strong> [VAT identification number, if applicable]
            </p>
          </div>
        ),
      },
      {
        title: "Why these details are required",
        content: (
          <p>
            Section 5 of Germanyâ€™s Digital Services Act requires covered
            commercial digital-service providers to keep specified identity and
            contact information easily recognizable, directly accessible, and
            permanently available.
          </p>
        ),
      },
    ],
    title: "Legal notice",
  },
};

export function LegalPage({ kind }: LegalPageProps) {
  const page = pageContent[kind];

  return (
    <div className="min-h-screen bg-canvas">
      <Seo
        description={page.description}
        noIndex
        path={`/${kind}`}
        title={page.title}
      />
      <header className="border-b border-line bg-surface">
        <PageContainer>
          <div className="flex min-h-18 items-center justify-between gap-6">
            <Link
              className="text-lg font-bold tracking-[-0.03em] text-brand-900"
              to="/"
            >
              autoapply
            </Link>
            <Link
              className="text-sm font-semibold text-brand-800 hover:text-brand-600"
              to="/"
            >
              Back to website
            </Link>
          </div>
        </PageContainer>
      </header>

      <main className="py-14 sm:py-20">
        <PageContainer size="narrow">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {page.title}
          </h1>
          <p className="lead mt-6 max-w-3xl">{page.description}</p>

          <aside className="mt-10 rounded-card border border-brand-200 bg-brand-50 p-5 text-sm leading-relaxed text-brand-950">
            This page is a structured implementation draft, not final legal
            advice. Business-specific placeholders must be completed and reviewed
            before the service launches.
          </aside>

          <div className="mt-10 space-y-5">
            {page.sections.map((section) => (
              <section
                className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
                key={section.title}
              >
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="body-copy mt-4">{section.content}</div>
              </section>
            ))}
          </div>

          <section className="mt-10 border-t border-line pt-8">
            <h2 className="text-sm font-semibold">Official references</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>
                <a
                  className="underline decoration-brand-200 underline-offset-4 hover:text-brand-800"
                  href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en"
                  rel="noreferrer"
                  target="_blank"
                >
                  European Commission: GDPR information and individual rights
                </a>
              </li>
              <li>
                <a
                  className="underline decoration-brand-200 underline-offset-4 hover:text-brand-800"
                  href="https://www.gesetze-im-internet.de/ddg/__5.html"
                  rel="noreferrer"
                  target="_blank"
                >
                  German Federal Ministry of Justice: Section 5 DDG
                </a>
              </li>
            </ul>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}

