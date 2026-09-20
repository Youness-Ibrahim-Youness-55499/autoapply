import { defineConfig } from "vitest/config";

// Unit tests cover the pure logic (matching, stats, pricing, CV optimizer,
// translations). They run in Node, so no browser or Supabase is needed.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
