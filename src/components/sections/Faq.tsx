import { PageContainer } from "../layout/PageContainer";
import { Section } from "../ui/Section";
import { useTranslation } from "../../i18n";

const questions = [
  {
    answerKey: "faq.q1.answer",
    questionKey: "faq.q1.question",
  },
  {
    answerKey: "faq.q2.answer",
    questionKey: "faq.q2.question",
  },
  {
    answerKey: "faq.q3.answer",
    questionKey: "faq.q3.question",
  },
  {
    answerKey: "faq.q4.answer",
    questionKey: "faq.q4.question",
  },
  {
    answerKey: "faq.q5.answer",
    questionKey: "faq.q5.question",
  },
];

export function Faq() {
  const { t } = useTranslation();

  return (
    <Section id="faq" spacing="spacious">
      <PageContainer>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">{t("faq.eyebrow")}</p>
            <h2 className="section-title mt-4">{t("faq.title")}</h2>
            <p className="lead mt-6 max-w-md">
              {t("faq.description")}
            </p>
          </div>

          <div className="border-t border-line">
            {questions.map((item) => (
              <details className="group border-b border-line py-1" key={item.questionKey}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-6 text-lg font-semibold marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2">
                  {t(item.questionKey)}
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-xl font-normal transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="body-copy max-w-2xl pb-6 pr-12">
                  {t(item.answerKey)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </PageContainer>
    </Section>
  );
}
