import { describe, it, expect } from "bun:test";
import { calculateInterest } from "./compound";

describe("calculateInterest", () => {
    describe("principal only (no contributions)", () => {
        it("compounds annually correctly", () => {
            // $10,000 at 7% for 10 years = $19,671.51
            const result = calculateInterest(1000000, 0, 7, 10, "annually");
            expect(result).toBe(1967151);
        });

        it("compounds monthly correctly", () => {
            // $10,000 at 7% for 10 years = $20,096.61
            const result = calculateInterest(1000000, 0, 7, 10, "monthly");
            expect(result).toBe(2009661);
        });

        it("compounds quarterly correctly", () => {
            // $10,000 at 7% for 10 years
            const result = calculateInterest(1000000, 0, 7, 10, "quarterly");
            expect(result).toBe(2001597);
        });

        it("compounds daily correctly", () => {
            // $10,000 at 7% for 10 years
            const result = calculateInterest(1000000, 0, 7, 10, "daily");
            expect(result).toBe(2013618);
        });
    });

    describe("with monthly contributions", () => {
        it("handles annual compounding with contributions", () => {
            // $10,000 initial, $100/month, 7%, 10 years
            const result = calculateInterest(1000000, 10000, 7, 10, "annually");
            expect(result).toBe(3625125);
        });

        it("handles monthly compounding with contributions", () => {
            // $10,000 initial, $100/month, 7%, 10 years
            const result = calculateInterest(1000000, 10000, 7, 10, "monthly");
            expect(result).toBe(3740509);
        });
    });

    describe("edge cases", () => {
        it("handles zero interest rate", () => {
            // $10,000 + $100/month for 10 years = $10,000 + $12,000 = $22,000
            const result = calculateInterest(1000000, 10000, 0, 10, "annually");
            expect(result).toBe(2200000);
        });

        it("handles zero principal", () => {
            const result = calculateInterest(0, 10000, 7, 10, "annually");
            expect(result).toBeGreaterThan(0);
        });

        it("handles zero contributions", () => {
            const result = calculateInterest(1000000, 0, 7, 10, "annually");
            expect(result).toBe(1967151);
        });

        it("defaults to annual compounding", () => {
            const withDefault = calculateInterest(1000000, 0, 7, 10);
            const withAnnual = calculateInterest(1000000, 0, 7, 10, "annually");
            expect(withDefault).toBe(withAnnual);
        });
    });
});
