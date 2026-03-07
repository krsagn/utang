import { describe, it, expect } from "vitest";
import { formatCurrency, formatCompactCurrency } from "../formatCurrency";

describe("formatCurrency", () => {
  describe("when given a valid number", () => {
    it("should format it with a currency symbol and two decimal places", async () => {
      const result = formatCurrency(50.5, "USD");
      expect(result).toBe("$50.50");
    });
  });

  describe("when given a valid string", () => {
    it("should parse the string and format it with a currency symbol and two decimal places", async () => {
      const result = formatCurrency("100", "USD");
      expect(result).toBe("$100.00");
    });
  });
});

describe("formatCompactCurrency", () => {
  describe("when given a large number", () => {
    it("should abbreviate it into a compact representation", async () => {
      const result = formatCompactCurrency(1500, "USD");
      expect(result).toBe("$1.50K");
    });
  });
});
