export const onboardingSteps = [
  "upload",
  "about",
  "preferences",
  "mode",
  "preview",
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];
