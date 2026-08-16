export interface RetirementResult {
    targetValue: number;
    yearsToRetirement: number;
    retirementDate: Date;
    retirementAge?: number;
}

export function calculateRetirement(
    currentValue: number,
    annualSavings: number,
    annualExpenses: number,
    safeWithdrawalRate: number,
    expectedRealReturn: number,
    birthday?: string | null,
): RetirementResult | "already" | "impossible" {
    const targetValue = annualExpenses / (safeWithdrawalRate / 100);

    if (currentValue >= targetValue) {
        return "already";
    }

    const r = expectedRealReturn / 100;

    if (r === 0) {
        // No growth — simple linear calculation
        const yearsToRetirement = (targetValue - currentValue) / annualSavings;
        if (yearsToRetirement < 0 || !isFinite(yearsToRetirement)) {
            return "impossible";
        }
        const retirementDate = addYears(new Date(), yearsToRetirement);
        return { targetValue, yearsToRetirement, retirementDate };
    }

    const numerator = targetValue * r + annualSavings;
    const denominator = currentValue * r + annualSavings;

    if (denominator <= 0 || numerator <= 0 || numerator / denominator <= 0) {
        return "impossible";
    }

    const yearsToRetirement =
        Math.log(numerator / denominator) / Math.log(1 + r);

    if (yearsToRetirement < 0 || !isFinite(yearsToRetirement)) {
        return "impossible";
    }

    const retirementDate = addYears(new Date(), yearsToRetirement);

    let retirementAge: number | undefined;
    if (birthday) {
        const birthDate = new Date(birthday);
        const ageInMs = Date.now() - birthDate.getTime();
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        retirementAge = ageInYears + yearsToRetirement;
    }

    return { targetValue, yearsToRetirement, retirementDate, retirementAge };
}

/** Contributions land every two weeks, so 26 a year. */
export const CONTRIBUTIONS_PER_YEAR = 26;

export interface ProjectionPoint {
    /** Years from today. */
    year: number;
    /** Portfolio value at this point. */
    balance: number;
    /** Starting value plus everything paid in so far — the balance less growth. */
    contributed: number;
}

/**
 * Period-by-period projection of the portfolio, with the annual savings paid in
 * as equal biweekly contributions rather than one lump at year end.
 *
 * Because the money arrives throughout the year it compounds sooner, so this
 * reaches `targetValue` slightly earlier than `calculateRetirement`, which uses
 * the closed-form annual annuity.
 */
export function projectGrowth(
    currentValue: number,
    annualSavings: number,
    expectedRealReturn: number,
    maxYears: number,
    targetValue?: number,
): ProjectionPoint[] {
    if (!isFinite(maxYears) || maxYears <= 0) return [];

    // A century of biweekly points is plenty; a longer horizon says more about
    // the inputs than about any plan worth charting.
    const periods = Math.min(
        Math.ceil(maxYears * CONTRIBUTIONS_PER_YEAR),
        100 * CONTRIBUTIONS_PER_YEAR,
    );
    // Geometric, not r/26, so the periods still compound to the annual rate.
    const periodRate =
        Math.pow(1 + expectedRealReturn / 100, 1 / CONTRIBUTIONS_PER_YEAR) - 1;
    const perPeriod = annualSavings / CONTRIBUTIONS_PER_YEAR;

    let balance = currentValue;
    let contributed = currentValue;
    const points: ProjectionPoint[] = [{ year: 0, balance, contributed }];

    for (let p = 1; p <= periods; p++) {
        balance = balance * (1 + periodRate) + perPeriod;
        contributed += perPeriod;
        points.push({ year: p / CONTRIBUTIONS_PER_YEAR, balance, contributed });
        if (targetValue != null && balance >= targetValue) break;
    }

    return points;
}

export function calculateRequiredSavings(
    currentValue: number,
    targetValue: number,
    expectedRealReturn: number,
    targetYears: number,
): number | "impossible" {
    if (targetYears <= 0) return "impossible";
    const r = expectedRealReturn / 100;
    if (r === 0) {
        return (targetValue - currentValue) / targetYears;
    }
    const A = Math.pow(1 + r, targetYears);
    return (r * (targetValue - A * currentValue)) / (A - 1);
}

function addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setTime(result.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
    return result;
}

export function formatCurrency(value: number): string {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
