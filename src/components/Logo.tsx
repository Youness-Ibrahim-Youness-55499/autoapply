type LogoVariant = "full" | "icon";

type LogoProps = {
  className?: string;
  variant?: LogoVariant;
};

const variantSources: Record<LogoVariant, string> = {
  full: "/jobman-logo.png",
  icon: "/jobman-icon.png",
};

const defaultHeights: Record<LogoVariant, string> = {
  full: "h-9",
  icon: "h-8",
};

// A caller-supplied h-* class replaces the default height instead of fighting it.
export function Logo({ className = "", variant = "full" }: LogoProps) {
  const heightClass = /(^|\s)h-/.test(className) ? "" : defaultHeights[variant];

  return (
    <img
      alt="Jobman"
      className={`${heightClass} ${className}`}
      src={variantSources[variant]}
    />
  );
}
