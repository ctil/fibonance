export interface RetirementResult {
	targetValue: number;
	yearsToRetirement: number;
	retirementDate: Date;
}

export function calculateRetirement(
	currentValue: number,
	annualSavings: number,
	annualExpenses: number,
	safeWithdrawalRate: number,
	expectedRealReturn: number,
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
		const retirementDate = new Date();
		retirementDate.setFullYear(
			retirementDate.getFullYear() + Math.ceil(yearsToRetirement),
		);
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

	const retirementDate = new Date();
	retirementDate.setFullYear(
		retirementDate.getFullYear() + Math.ceil(yearsToRetirement),
	);

	return { targetValue, yearsToRetirement, retirementDate };
}
