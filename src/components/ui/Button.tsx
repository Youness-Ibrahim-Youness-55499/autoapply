import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "danger" | "primary" | "secondary" | "quiet";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  danger:
    "border-red-700 bg-red-700 text-white shadow-button hover:border-red-800 hover:bg-red-800",
  primary:
    "border-brand-900 bg-brand-900 text-white shadow-button hover:border-brand-800 hover:bg-brand-800",
  secondary:
    "border-line bg-surface text-ink shadow-button hover:border-brand-200 hover:bg-brand-50",
  quiet:
    "border-transparent bg-transparent text-ink hover:bg-brand-50 hover:text-brand-900",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 button-text",
  md: "min-h-11 px-5 button-text",
  lg: "min-h-12 px-6 button-text",
};

export type ButtonProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string,
) {
  return `inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export function Button({
  children,
  className = "",
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export type ButtonLinkProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonLink({
  children,
  className = "",
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </a>
  );
}
