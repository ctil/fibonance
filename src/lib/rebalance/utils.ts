/**
 * Parse a dollar amount string (e.g., "$80,000.00") to cents (integer).
 */
export function amountToInt(amount: string): number {
  let cleaned = amount.replace(/^\$/, "");
  cleaned = cleaned.replace(/,/g, "");
  cleaned = cleaned.replace(".", "");
  return parseInt(cleaned, 10);
}

/**
 * Format cents (integer) to a dollar string.
 */
export function formatAmount(amount: number, includeCommas: boolean): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  let amountStr = absAmount.toString();

  // Ensure at least 3 characters for slicing (e.g., "001" for 1 cent)
  if (amountStr.length < 3) {
    amountStr = amountStr.padStart(3, "0");
  }

  let dollars = amountStr.slice(0, -2);
  const cents = amountStr.slice(-2);

  if (includeCommas) {
    for (let i = dollars.length - 3; i > 0; i -= 3) {
      dollars = dollars.slice(0, i) + "," + dollars.slice(i);
    }
  }

  const formatted = "$" + dollars + "." + cents;
  return isNegative ? "-" + formatted : formatted;
}
