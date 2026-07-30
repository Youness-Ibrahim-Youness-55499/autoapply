import { useLocation } from "react-router-dom";
import { Seo } from "../components/Seo";
import { PageContainer } from "../components/layout/PageContainer";

type ProductRoutePlaceholderPageProps = {
  description: string;
  title: string;
};

export function ProductRoutePlaceholderPage({
  description,
  title,
}: ProductRoutePlaceholderPageProps) {
  const location = useLocation();

  return (
    <>
      <Seo description={description} noIndex path={location.pathname} title={title} />
      <PageContainer className="py-10 sm:py-14 lg:px-10" size="wide">
        <p className="eyebrow">Your workspace</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {title}
        </h2>
        <p className="lead mt-5 max-w-2xl">{description}</p>
        <section className="mt-10 max-w-3xl rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <h3 className="text-lg font-semibold">Route ready</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            This authenticated area is in place. Its product functionality will be added
            in a focused development task.
          </p>
        </section>
      </PageContainer>
    </>
  );
}
