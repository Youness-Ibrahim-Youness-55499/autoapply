import { describe, expect, it } from "vitest";
import { billingPeriods, planCatalog, priceFor, round2 } from "./plans";

const period = (id: string) => {
  const found = billingPeriods.find((item) => item.id === id);
  if (!found) throw new Error(`no ${id} period`);
  return found;
};

describe("priceFor", () => {
  it("charges the plain monthly price with no discount", () => {
    expect(priceFor(14.99, period("monthly"))).toEqual({ perMonth: 14.99, total: 14.99 });
  });

  it("applies the quarterly discount to three months", () => {
    expect(priceFor(14.99, period("quarterly"))).toEqual({ perMonth: 11.99, total: 35.98 });
    expect(priceFor(24.99, period("quarterly"))).toEqual({ perMonth: 19.99, total: 59.98 });
  });

  it("applies the annual discount to twelve months", () => {
    expect(priceFor(14.99, period("annual"))).toEqual({ perMonth: 9.74, total: 116.92 });
    expect(priceFor(24.99, period("annual"))).toEqual({ perMonth: 16.24, total: 194.92 });
  });

  it("keeps the free plan free on every period", () => {
    for (const item of billingPeriods) {
      expect(priceFor(0, item)).toEqual({ perMonth: 0, total: 0 });
    }
  });

  it("makes longer periods cheaper per month", () => {
    const [monthly, quarterly, annual] = billingPeriods.map((item) => priceFor(24.99, item).perMonth);

    expect(quarterly).toBeLessThan(monthly);
    expect(annual).toBeLessThan(quarterly);
  });
});

describe("round2", () => {
  it("rounds to cents", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(11.9933)).toBe(11.99);
  });
});

describe("planCatalog", () => {
  it("lists Free, Pro and ProMax with increasing volume and price", () => {
    expect(planCatalog.map((plan) => plan.id)).toEqual(["free", "pro", "promax"]);
    expect(planCatalog.map((plan) => plan.applicationsPerMonth)).toEqual([20, 300, 500]);
    expect(planCatalog[0].monthly).toBe(0);
    expect(planCatalog[1].monthly).toBeLessThan(planCatalog[2].monthly);
  });
});
