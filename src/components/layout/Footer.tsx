import { PageContainer } from "./PageContainer";

const footerGroups = [
  {
    links: [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Pricing", "#pricing"],
      ["FAQ", "#faq"],
    ],
    title: "Product",
  },
  {
    links: [
      ["Contact", "mailto:hello@autoapply.app"],
      ["FAQ", "#faq"],
      ["Back to top", "#top"],
    ],
    title: "Help",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface" id="footer">
      <PageContainer>
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.75fr_0.75fr]">
          <div>
            <a
              className="text-xl font-bold tracking-[-0.03em] text-brand-900"
              href="#top"
            >
              autoapply
            </a>
            <p className="body-copy mt-4 max-w-sm">
              A calmer workspace for organizing and improving every job
              application.
            </p>
            <a
              className="mt-6 inline-block text-sm font-semibold text-brand-800 underline decoration-brand-200 underline-offset-4"
              href="mailto:hello@autoapply.app"
            >
              hello@autoapply.app
            </a>
          </div>

          {footerGroups.map((group) => (
            <nav aria-label={`${group.title} links`} key={group.title}>
              <p className="text-sm font-semibold">{group.title}</p>
              <ul className="mt-4 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      className="text-sm text-ink-muted hover:text-brand-800"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 Autoapply.</p>
          <p>Built for thoughtful job searches.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
