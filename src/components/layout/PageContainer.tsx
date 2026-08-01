import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type ContainerSize = "full" | "wide" | "default" | "narrow";

const sizeClasses: Record<ContainerSize, string> = {
  full: "max-w-none",
  wide: "max-w-[90rem]",
  default: "max-w-7xl",
  narrow: "max-w-5xl",
};

type PageContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function PageContainer<T extends ElementType = "div">({
  as,
  children,
  className = "",
  size = "default",
  ...props
}: PageContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`mx-auto w-full px-5 sm:px-8 lg:px-12 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

