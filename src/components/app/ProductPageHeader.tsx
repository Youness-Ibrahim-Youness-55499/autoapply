type ProductPageHeaderProps = {
  description: string;
  eyebrow?: string;
  title: string;
};

export function ProductPageHeader({
  description,
  eyebrow = "Your workspace",
  title,
}: ProductPageHeaderProps) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        {title}
      </h2>
      <p className="lead mt-5 max-w-2xl">{description}</p>
    </header>
  );
}
