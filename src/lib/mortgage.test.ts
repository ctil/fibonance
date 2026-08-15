import { describe, it, expect } from "bun:test";
import {
    amortize,
    currentBalance,
    formatTerm,
    monthlyPayment,
    monthsBetween,
    payoffDate,
    solveExtraForMonths,
    type AmortizeResult,
} from "./mortgage";

// $319,000 at 6.375% over 30 years, roughly the reference scenario.
const LOAN = {
    balance: 31_900_000,
    rate: 6375,
    payment: monthlyPayment(31_900_000, 6375, 360),
};

function ok(result: AmortizeResult | "never"): AmortizeResult {
    expect(result).not.toBe("never");
    return result as AmortizeResult;
}

describe("monthlyPayment", () => {
    it("matches the standard amortization formula", () => {
        // $319,000 at 6.375% / 30yr = $1,990.14/mo
        expect(monthlyPayment(31_900_000, 6375, 360)).toBe(199_014);
    });

    it("is a simple division at 0%", () => {
        expect(monthlyPayment(12_000_00, 0, 12)).toBe(100_000);
    });

    it("returns 0 for a zero-length term", () => {
        expect(monthlyPayment(12_000_00, 6375, 0)).toBe(0);
    });
});

describe("amortize", () => {
    describe("basic calculations", () => {
        it("clears the term with at most a stub payment", () => {
            // Rounding the payment to the nearest cent leaves a few dollars
            // after the last scheduled payment, exactly as a real servicer's
            // adjusted final payment does.
            const r = ok(amortize(LOAN));
            expect(r.schedule[359]).toBeLessThan(1_000);
            expect(r.months).toBeLessThanOrEqual(361);
            expect(r.months).toBeGreaterThanOrEqual(360);
        });

        it("ends at a zero balance", () => {
            const r = ok(amortize(LOAN));
            expect(r.schedule.at(-1)).toBe(0);
            expect(r.schedule.length).toBe(r.months);
        });

        it("charges no interest at a 0% rate", () => {
            // $12,000 at 0% paid $1,000/mo = 12 months, no interest
            const r = ok(
                amortize({ balance: 12_000_00, rate: 0, payment: 100_000 }),
            );
            expect(r.months).toBe(12);
            expect(r.totalInterest).toBe(0);
        });

        it("charges one month of interest on a loan repaid in one payment", () => {
            // $1,000 at 12% => $10 interest in month one
            const r = ok(
                amortize({ balance: 100_000, rate: 12_000, payment: 200_000 }),
            );
            expect(r.months).toBe(1);
            expect(r.totalInterest).toBe(1_000);
            expect(r.schedule).toEqual([0]);
        });
    });

    describe("extra principal", () => {
        it("shortens the term and reduces total interest", () => {
            const base = ok(amortize(LOAN));
            const extra = ok(amortize({ ...LOAN, extra: 30_000 }));
            expect(extra.months).toBeLessThan(base.months);
            expect(extra.totalInterest).toBeLessThan(base.totalInterest);
        });

        it("shortens the term further as the extra grows", () => {
            const a = ok(amortize({ ...LOAN, extra: 10_000 })).months;
            const b = ok(amortize({ ...LOAN, extra: 50_000 })).months;
            const c = ok(amortize({ ...LOAN, extra: 100_000 })).months;
            expect(a).toBeGreaterThan(b);
            expect(b).toBeGreaterThan(c);
        });
    });

    describe("lump sum", () => {
        it("shortens the term versus no lump sum", () => {
            const base = ok(amortize(LOAN));
            const lump = ok(
                amortize({
                    ...LOAN,
                    lumpSum: { amount: 2_000_000, month: 12 },
                }),
            );
            expect(lump.months).toBeLessThan(base.months);
        });

        it("applies only in the month given", () => {
            const early = ok(
                amortize({ ...LOAN, lumpSum: { amount: 2_000_000, month: 1 } }),
            );
            const late = ok(
                amortize({
                    ...LOAN,
                    lumpSum: { amount: 2_000_000, month: 120 },
                }),
            );
            expect(early.totalInterest).toBeLessThan(late.totalInterest);
        });
    });

    describe("edge cases", () => {
        it("returns 'never' when the payment is below the monthly interest", () => {
            // $300,000 at 6% is $1,500/mo interest; paying $1,000 never amortizes
            expect(
                amortize({ balance: 30_000_000, rate: 6000, payment: 100_000 }),
            ).toBe("never");
        });

        it("returns 'never' when the payment exactly equals the interest", () => {
            // $100,000 at 12% is exactly $1,000/mo interest
            expect(
                amortize({
                    balance: 10_000_000,
                    rate: 12_000,
                    payment: 100_000,
                }),
            ).toBe("never");
        });

        it("pays off an interest-only payment once extra principal is added", () => {
            const r = ok(
                amortize({
                    balance: 10_000_000,
                    rate: 12_000,
                    payment: 100_000,
                    extra: 100_000,
                }),
            );
            expect(r.months).toBeGreaterThan(0);
            expect(r.schedule.at(-1)).toBe(0);
        });

        it("returns a zero-month result for a paid-off loan", () => {
            const r = ok(amortize({ ...LOAN, balance: 0 }));
            expect(r.months).toBe(0);
            expect(r.totalInterest).toBe(0);
        });
    });
});

describe("monthsBetween", () => {
    it("counts whole months", () => {
        expect(monthsBetween("2020-01-01", "2021-01-01")).toBe(12);
        expect(monthsBetween("2020-01-15", "2020-02-15")).toBe(1);
    });

    it("does not count a partial month", () => {
        expect(monthsBetween("2020-01-15", "2020-02-14")).toBe(0);
    });

    it("is negative when the target precedes the start", () => {
        expect(monthsBetween("2021-01-01", "2020-01-01")).toBe(-12);
    });
});

describe("currentBalance", () => {
    const terms = {
        startDate: "2020-01-01",
        originalAmount: 31_900_000,
        interestRate: 6375,
        piPayment: LOAN.payment,
    };

    it("returns the original amount before the first payment", () => {
        expect(currentBalance(terms, "2019-12-01")).toBe(31_900_000);
        expect(currentBalance(terms, "2020-01-01")).toBe(31_900_000);
    });

    it("amortizes forward from origination", () => {
        const after12 = currentBalance(terms, "2021-01-01");
        expect(after12).toBeLessThan(31_900_000);
        // Barely any principal is paid in year one of a 30-year loan
        expect(after12).toBeGreaterThan(31_000_000);
    });

    it("returns zero once the loan is paid off", () => {
        expect(currentBalance(terms, "2060-01-01")).toBe(0);
    });

    it("prefers the override when balanceAsOf is set", () => {
        const withOverride = {
            ...terms,
            currentBalance: 20_000_000,
            balanceAsOf: "2025-01-01",
        };
        expect(currentBalance(withOverride, "2025-01-01")).toBe(20_000_000);
        expect(currentBalance(withOverride, "2026-01-01")).toBeLessThan(
            20_000_000,
        );
    });

    it("ignores a balance without an as-of date", () => {
        const partial = { ...terms, currentBalance: 20_000_000 };
        expect(currentBalance(partial, "2020-01-01")).toBe(31_900_000);
    });
});

describe("solveExtraForMonths", () => {
    it("returns 0 when the target is already met", () => {
        expect(solveExtraForMonths(LOAN, 400)).toBe(0);
    });

    it("finds the smallest extra that hits the target", () => {
        const target = 240;
        const extra = solveExtraForMonths(LOAN, target);
        expect(extra).not.toBeNull();

        const hit = ok(amortize({ ...LOAN, extra: extra! }));
        expect(hit.months).toBeLessThanOrEqual(target);

        const oneCentLess = ok(amortize({ ...LOAN, extra: extra! - 1 }));
        expect(oneCentLess.months).toBeGreaterThan(target);
    });

    it("returns null when the target is unreachable", () => {
        expect(solveExtraForMonths(LOAN, 0)).toBeNull();
    });

    it("still solves a loan that never amortizes on its own", () => {
        // $100/mo on $300,000 at 6% is far below the interest, but enough
        // extra principal still clears it inside the target.
        const bad = { balance: 30_000_000, rate: 6000, payment: 10_000 };
        expect(amortize(bad)).toBe("never");

        const extra = solveExtraForMonths(bad, 120);
        expect(extra).not.toBeNull();
        expect(
            ok(amortize({ ...bad, extra: extra! })).months,
        ).toBeLessThanOrEqual(120);
    });
});

describe("formatTerm", () => {
    it("formats years and months", () => {
        expect(formatTerm(148)).toBe("12 yr 4 mo");
        expect(formatTerm(8)).toBe("8 mo");
        expect(formatTerm(24)).toBe("2 yr");
        expect(formatTerm(0)).toBe("0 mo");
    });
});

describe("payoffDate", () => {
    it("returns the month of the final payment", () => {
        const d = payoffDate("2026-09-01", 1);
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(8); // September
    });

    it("rolls over the year boundary", () => {
        const d = payoffDate("2026-09-01", 5);
        expect(d.getFullYear()).toBe(2027);
        expect(d.getMonth()).toBe(0); // January
    });
});
