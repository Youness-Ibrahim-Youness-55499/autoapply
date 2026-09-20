import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClasses } from "./Button";

type LinkButtonProps = {
  children: ReactNode;
  className?: string;
  size?: "lg" | "md" | "sm";
  variant?: "primary" | "quiet" | "secondary";
} & Omit<LinkProps, "className">;

// React Router <Link> styled exactly like <Button>, for navigation CTAs.
export function LinkButton({ children, className = "", size = "md", variant = "primary", ...props }: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
