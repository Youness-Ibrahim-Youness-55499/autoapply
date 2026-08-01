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
      <h2 className="page-heading mt-4">{title}</h2>
      <p className="lead mt-5 max-w-2xl">{description}</p>
    </header>
  );
}
