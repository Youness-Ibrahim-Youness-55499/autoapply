type BrandLogoProps = {
  className?: string;
  markClassName?: string;
};

export function BrandLogo({
  className = "",
  markClassName = "h-8 w-auto",
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        alt=""
        aria-hidden="true"
        className={markClassName}
        src="/jobman-mark.svg"
      />
      <span>Jobman</span>
    </span>
  );
}
