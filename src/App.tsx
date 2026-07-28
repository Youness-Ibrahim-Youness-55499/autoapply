import { PageContainer } from "./components/layout/PageContainer";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Section } from "./components/ui/Section";

export function App() {
  return (
    <main>
      <Section spacing="hero">
        <PageContainer size="narrow">
          <p className="eyebrow">Autoapply design foundation</p>

          <h1 className="display-title mt-5">
            A calmer way to improve every application.
          </h1>

          <p className="lead mt-6 max-w-2xl">
            The core visual language is ready. Homepage sections will be added
            in later, focused tasks.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary action</Button>
            <Button variant="quiet">Quiet action</Button>
          </div>

          <Card className="mt-12">
            <p className="eyebrow">Foundation preview</p>
            <h2 className="section-title mt-3">
              Quiet surfaces, clear hierarchy.
            </h2>
            <p className="body-copy mt-4 max-w-xl">
              Restrained borders, soft corners, and generous spacing keep the
              interface professional without feeling impersonal.
            </p>
          </Card>
        </PageContainer>
      </Section>
    </main>
  );
}

