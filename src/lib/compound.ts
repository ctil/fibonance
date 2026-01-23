/**
 * Calculate compound interest with regular monthly contributions
 * @param principal - Initial deposit in cents
 * @param monthlyContribution - Monthly contribution in cents
 * @param annualRatePercent - Annual interest rate as percentage (e.g., 7 for 7%)
 * @param years - Number of years
 * @returns Final amount in cents
 */
export function calculateInterest(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number
): number {
  const annualRate = annualRatePercent / 100;
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  // Future value of initial principal
  const principalFV = principal * Math.pow(1 + monthlyRate, months);

  // Future value of monthly contributions (annuity formula)
  const contributionsFV =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return Math.round(principalFV + contributionsFV);
}
