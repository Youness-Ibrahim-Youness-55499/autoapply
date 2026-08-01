import type { Transition, Variants } from "framer-motion";

type CubicBezier = [number, number, number, number];

export const ease: Record<"soft" | "expo" | "standard", CubicBezier> = {
  soft: [0.22, 1, 0.36, 1],
  expo: [0.16, 1, 0.3, 1],
  standard: [0.4, 0, 0.2, 1],
};

export const duration = {
  micro: 0.16,
  hover: 0.18,
  reveal: 0.75,
  headline: 0.85,
  dashboard: 1.1,
  section: 0.85,
} as const;

const softReveal: Transition = { duration: duration.reveal, ease: ease.soft };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: softReveal },
};

export const navEntrance: Variants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: ease.soft } },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.micro, ease: ease.soft } },
};

export const headlineLine: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(9px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.headline, ease: ease.soft },
  },
};

export const dashboardReveal: Variants = {
  hidden: { opacity: 0, y: 55, scale: 0.985, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: duration.dashboard, delay: 0.35, ease: ease.expo },
  },
};

export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const headlineStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const sectionReveal = {
  once: true,
  amount: 0.2,
} as const;
