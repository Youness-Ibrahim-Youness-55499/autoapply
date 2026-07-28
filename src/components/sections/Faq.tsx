import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";

const questions = [
  {
    answer:
      "No. Autoapply is designed to help you organize and improve your own applications, not submit them without your review.",
    question: "Does Autoapply apply to jobs for me?",
  },
  {
    answer:
      "You can store the opportunity, status, notes, deadlines, links, and the documents prepared for that specific role.",
    question: "What can I keep with each application?",
  },
  {
    answer:
      "Yes. The Starter plan is intended to let you organize a focused search before deciding whether you need more capacity.",
    question: "Can I begin for free?",
  },
  {
    answer:
      "The experience is designed for desktop and mobile layouts, so you can review progress and next steps wherever you work.",
    question: "Can I use it on my phone?",
  },
  {
    answer:
      "Your application information remains yours. Detailed privacy controls will be documented before account features launch.",
    question: "How will my application data be handled?",
  },
];

export function Faq() {
  return (
    <Section className="bg-surface" id="faq" spacing="spacious">
      <PageContainer>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Frequently asked questions</p>
            <h2 className="section-title mt-4">The practical details.</h2>
            <p className="lead mt-6 max-w-md">
              Clear answers about what Autoapply is designed to do and what
              remains under your control.
            </p>
          </div>

          <div className="border-t border-line">
            {questions.map((item) => (
              <details className="group border-b border-line py-1" key={item.question}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold marker:content-none">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-xl font-normal transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="body-copy max-w-2xl pb-6 pr-12">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
