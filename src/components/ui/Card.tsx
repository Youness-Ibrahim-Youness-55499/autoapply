import type { HTMLAttributes, ReactNode } from "react";

type CardPadding = "sm" | "md" | "lg";

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-5",
  md: "p-6 sm:p-8",
  lg: "p-7 sm:p-10 lg:p-12",
};

export type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: CardPadding;
} & HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  className = "",
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-surface shadow-card ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

