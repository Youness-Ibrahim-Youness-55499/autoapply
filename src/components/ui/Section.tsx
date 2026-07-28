import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SectionSpacing = "compact" | "default" | "spacious" | "hero";

const spacingClasses: Record<SectionSpacing, string> = {
  compact: "py-12 sm:py-16",
  default: "py-16 sm:py-24",
  spacious: "py-24 sm:py-32 lg:py-40",
  hero: "py-20 sm:py-28 lg:py-36",
};

type SectionProps<T extends ElementType = "section"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  spacing?: SectionSpacing;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Section<T extends ElementType = "section">({
  as,
  children,
  className = "",
  spacing = "default",
  ...props
}: SectionProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={`${spacingClasses[spacing]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

