export type CompoundFrequency = "annually" | "quarterly" | "monthly" | "daily";

const PERIODS_PER_YEAR: Record<CompoundFrequency, number> = {
    annually: 1,
    quarterly: 4,
    monthly: 12,
    daily: 365,
};

/**
 * Calculate compound interest with regular contributions
 * @param principal - Initial deposit in cents
 * @param monthlyContribution - Monthly contribution in cents
 * @param annualRatePercent - Annual interest rate as percentage (e.g., 7 for 7%)
 * @param years - Number of years
 * @param frequency - Compounding frequency (default: annually)
 * @returns Final amount in cents
 */
export function calculateInterest(
    principal: number,
    monthlyContribution: number,
    annualRatePercent: number,
    years: number,
    frequency: CompoundFrequency = "annually",
): number {
    const annualRate = annualRatePercent / 100;
    const periodsPerYear = PERIODS_PER_YEAR[frequency];
    const periodRate = annualRate / periodsPerYear;
    const totalPeriods = years * periodsPerYear;

    // Future value of initial principal
    const principalFV = principal * Math.pow(1 + periodRate, totalPeriods);

    // Future value of contributions using standard annuity formula
    // Contributions are scaled to match compounding frequency
    // (e.g., monthly $100 becomes $1200/year for annual compounding)
    const contributionPerPeriod = (monthlyContribution * 12) / periodsPerYear;
    let contributionsFV = 0;
    if (contributionPerPeriod > 0 && periodRate > 0) {
        contributionsFV =
            contributionPerPeriod *
            ((Math.pow(1 + periodRate, totalPeriods) - 1) / periodRate);
    } else if (contributionPerPeriod > 0) {
        contributionsFV = contributionPerPeriod * totalPeriods;
    }

    return Math.round(principalFV + contributionsFV);
}
