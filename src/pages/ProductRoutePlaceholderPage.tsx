import { Link, useLocation } from "react-router-dom";
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
    <main className="min-h-screen bg-canvas py-16">
      <Seo description={description} noIndex path={location.pathname} title={title} />
      <PageContainer size="narrow">
        <Link
          className="text-sm font-semibold text-brand-800 hover:text-brand-600"
          to="/app"
        >
          Back to workspace
        </Link>
        <p className="eyebrow mt-12">Your workspace</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {title}
        </h1>
        <p className="lead mt-5 max-w-2xl">{description}</p>
        <section className="mt-10 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-semibold">Route ready</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            This authenticated area is in place. Its product functionality will be added
            in a focused development task.
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
