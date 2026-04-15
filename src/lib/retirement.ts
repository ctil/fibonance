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
