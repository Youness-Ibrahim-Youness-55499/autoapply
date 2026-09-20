// Illustrative launch pricing: billing is not enabled yet, so these numbers
// drive the landing page only. Keeping them here (not in the component) lets
// the arithmetic be tested and, later, be replaced by a billing backend.

export type Billing = "annual" | "monthly" | "quarterly";

export type BillingPeriod = { discount: number; id: Billing; months: number };

// Longer billing periods take a discount off the monthly price.
export const billingPeriods: BillingPeriod[] = [
  { discount: 0, id: "monthly", months: 1 },
  { discount: 0.2, id: "quarterly", months: 3 },
  { discount: 0.35, id: "annual", months: 12 },
];

export type PlanId = "free" | "pro" | "promax";

export type PlanCatalogEntry = {
  applicationsPerMonth: number;
  id: PlanId;
  monthly: number;
};

export const planCatalog: PlanCatalogEntry[] = [
  { applicationsPerMonth: 20, id: "free", monthly: 0 },
  { applicationsPerMonth: 300, id: "pro", monthly: 14.99 },
  { applicationsPerMonth: 500, id: "promax", monthly: 24.99 },
];

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

// What the customer is charged per billing period, and the equivalent per month.
export function priceFor(monthly: number, period: BillingPeriod) {
  const total = round2(monthly * period.months * (1 - period.discount));

  return { perMonth: round2(total / period.months), total };
}
