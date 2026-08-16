import { describe, it, expect } from "bun:test";
import {
    calculateRetirement,
    projectGrowth,
    CONTRIBUTIONS_PER_YEAR,
    type RetirementResult,
} from "./retirement";

describe("calculateRetirement", () => {
    describe("basic calculations", () => {
        it("calculates target value from expenses and SWR", () => {
            // $40,000 expenses / 4% SWR = $1,000,000 target
            const result = calculateRetirement(0, 20000, 40000, 4, 7);
            expect((result as RetirementResult).targetValue).toBe(1000000);
        });

        it("calculates years to retirement", () => {
            // $500,000 current, $30,000/year savings, $40,000 expenses, 4% SWR, 7% return
            // Target = $1,000,000
            const result = calculateRetirement(500000, 30000, 40000, 4, 7);
            const r = result as RetirementResult;
            expect(r.targetValue).toBe(1000000);
            expect(r.yearsToRetirement).toBeCloseTo(6.4, 1);
        });

        it("returns a future retirement date", () => {
            const result = calculateRetirement(500000, 30000, 40000, 4, 7);
            const r = result as RetirementResult;
            expect(r.retirementDate.getTime()).toBeGreaterThan(Date.now());
        });
    });

    describe("edge cases", () => {
        it("returns 'already' when current value meets target", () => {
            // Target = $40,000 / 0.04 = $1,000,000, current = $1,000,000
            const result = calculateRetirement(1000000, 30000, 40000, 4, 7);
            expect(result).toBe("already");
        });

        it("returns 'already' when current value exceeds target", () => {
            const result = calculateRetirement(1500000, 30000, 40000, 4, 7);
            expect(result).toBe("already");
        });

        it("returns 'impossible' when savings are zero and return is zero", () => {
            const result = calculateRetirement(100000, 0, 40000, 4, 0);
            expect(result).toBe("impossible");
        });

        it("handles zero return rate with positive savings", () => {
            // Target = $1,000,000, current = $500,000, saving $50,000/year, no growth
            // Years = ($1,000,000 - $500,000) / $50,000 = 10
            const result = calculateRetirement(500000, 50000, 40000, 4, 0);
            const r = result as RetirementResult;
            expect(r.yearsToRetirement).toBeCloseTo(10, 1);
        });

        it("handles zero current value", () => {
            const result = calculateRetirement(0, 30000, 40000, 4, 7);
            const r = result as RetirementResult;
            expect(r.yearsToRetirement).toBeGreaterThan(0);
            expect(r.targetValue).toBe(1000000);
        });

        it("returns 'impossible' when denominator is non-positive", () => {
            // currentValue * r + annualSavings <= 0
            // 0 * 0.07 + 0 = 0
            const result = calculateRetirement(0, 0, 40000, 4, 7);
            expect(result).toBe("impossible");
        });
    });

    describe("different SWR values", () => {
        it("calculates correctly with 3% SWR", () => {
            // $40,000 / 0.03 = $1,333,333.33
            const result = calculateRetirement(0, 50000, 40000, 3, 7);
            const r = result as RetirementResult;
            expect(r.targetValue).toBeCloseTo(1333333.33, 0);
        });

        it("calculates correctly with 5% SWR", () => {
            // $40,000 / 0.05 = $800,000
            const result = calculateRetirement(0, 50000, 40000, 5, 7);
            const r = result as RetirementResult;
            expect(r.targetValue).toBe(800000);
        });
    });
});

describe("projectGrowth", () => {
    it("starts at today's balance with nothing yet contributed", () => {
        const points = projectGrowth(500000, 26000, 7, 10);
        expect(points[0]).toEqual({
            year: 0,
            balance: 500000,
            contributed: 500000,
        });
    });

    it("adds one biweekly contribution per period", () => {
        const points = projectGrowth(0, 26000, 0, 1);
        expect(points).toHaveLength(CONTRIBUTIONS_PER_YEAR + 1);
        // No growth, so a full year of contributions is exactly the annual sum.
        const end = points[points.length - 1];
        expect(end.year).toBeCloseTo(1, 10);
        expect(end.balance).toBeCloseTo(26000, 6);
        expect(end.contributed).toBeCloseTo(26000, 6);
    });

    it("compounds the periods to the annual rate", () => {
        // No contributions, so this is pure compounding: $100k at 7% for 3y.
        const points = projectGrowth(100000, 0, 7, 3);
        const end = points[points.length - 1];
        expect(end.balance).toBeCloseTo(100000 * Math.pow(1.07, 3), 4);
        expect(end.contributed).toBe(100000);
    });

    it("beats the year-end annuity, because the money lands sooner", () => {
        const points = projectGrowth(0, 12000, 7, 10);
        const end = points[points.length - 1];
        const yearEnd = 12000 * ((Math.pow(1.07, 10) - 1) / 0.07);
        expect(end.balance).toBeGreaterThan(yearEnd);
        expect(end.contributed).toBeCloseTo(120000, 6);
    });

    it("stops at the target when one is given", () => {
        const points = projectGrowth(500000, 30000, 7, 20, 1000000);
        const end = points[points.length - 1];
        expect(end.balance).toBeGreaterThanOrEqual(1000000);
        expect(points[points.length - 2].balance).toBeLessThan(1000000);
        // Biweekly contributions get there before the annual closed form does.
        const annual = calculateRetirement(
            500000,
            30000,
            40000,
            4,
            7,
        ) as RetirementResult;
        expect(end.year).toBeLessThan(annual.yearsToRetirement);
    });

    it("returns nothing for a non-positive horizon", () => {
        expect(projectGrowth(500000, 30000, 7, 0)).toEqual([]);
        expect(projectGrowth(500000, 30000, 7, Infinity)).toEqual([]);
    });

    it("caps a runaway horizon at a century of periods", () => {
        const points = projectGrowth(1000, 100, 1, 500);
        expect(points).toHaveLength(100 * CONTRIBUTIONS_PER_YEAR + 1);
    });
});
