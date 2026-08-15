// Mortgage amortization and early-payoff scenarios.
//
// All money is in integer cents. Rates are stored as percent * 1000 so that a
// rate like 6.375% is representable as 6375 (the percent * 100 convention used
// by retirement_scenarios only holds two decimals).

/** Maximum months to simulate before giving up. 100 years. */
const GUARD_MONTHS = 1200;

export interface AmortizeOptions {
    /** Starting balance, cents. */
    balance: number;
    /** Annual interest rate, percent * 1000. */
    rate: number;
    /** Monthly principal + interest payment, cents. */
    payment: number;
    /** Recurring extra principal each month, cents. */
    extra?: number;
    /** One-time extra principal applied in a given 1-based month. */
    lumpSum?: { amount: number; month: number };
}

export interface AmortizeResult {
    /** Number of payments until the balance reaches zero. */
    months: number;
    /** Total interest paid over those months, cents. */
    totalInterest: number;
    /** Balance at the end of each month, cents. Length === months. */
    schedule: number[];
}

/**
 * Simulate paying a fixed principal+interest amount, plus optional extra
 * principal, until the loan is paid off.
 *
 * Escrow is intentionally not a parameter — taxes and insurance never change
 * the payoff schedule.
 *
 * Returns "never" when the payment cannot cover the monthly interest, so the
 * balance would grow forever.
 */
export function amortize(opts: AmortizeOptions): AmortizeResult | "never" {
    const { balance: startBalance, rate, payment } = opts;
    const extra = opts.extra ?? 0;
    const lumpSum = opts.lumpSum;

    if (startBalance <= 0) {
        return { months: 0, totalInterest: 0, schedule: [] };
    }

    const monthlyRate = rate / 1000 / 100 / 12;

    let balance = startBalance;
    let totalInterest = 0;
    let months = 0;
    const schedule: number[] = [];

    while (balance > 0 && months < GUARD_MONTHS) {
        const interest = Math.round(balance * monthlyRate);
        const lump =
            lumpSum != null && lumpSum.month === months + 1
                ? lumpSum.amount
                : 0;
        const principal = payment - interest + extra + lump;

        if (principal <= 0) return "never";

        totalInterest += interest;
        months += 1;

        if (principal >= balance) {
            balance = 0;
        } else {
            balance -= principal;
        }
        schedule.push(balance);
    }

    if (balance > 0) return "never";

    return { months, totalInterest, schedule };
}

/**
 * The standard fixed-rate monthly principal + interest payment, in cents.
 */
export function monthlyPayment(
    principal: number,
    rate: number,
    termMonths: number,
): number {
    if (termMonths <= 0) return 0;
    const monthlyRate = rate / 1000 / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / termMonths);
    const growth = Math.pow(1 + monthlyRate, termMonths);
    return Math.round((principal * monthlyRate * growth) / (growth - 1));
}

/**
 * Whole months elapsed between two ISO "YYYY-MM-DD" dates. Negative when `to`
 * precedes `from`. A partial month does not count until the day-of-month is
 * reached.
 */
export function monthsBetween(fromISO: string, toISO: string): number {
    const [fy, fm, fd] = fromISO.split("-").map(Number);
    const [ty, tm, td] = toISO.split("-").map(Number);
    let months = (ty - fy) * 12 + (tm - fm);
    if (td < fd) months -= 1;
    return months;
}

/** The subset of a mortgage record the balance calculation needs. */
export interface MortgageTerms {
    startDate: string;
    originalAmount: number;
    interestRate: number;
    piPayment: number;
    currentBalance?: number | null;
    balanceAsOf?: string | null;
}

/**
 * Balance owed as of `todayISO`.
 *
 * When a manual balance override is recorded, amortize forward from that
 * snapshot. Otherwise amortize forward from origination. Returns "never" if
 * the loan negatively amortizes.
 */
export function currentBalance(
    mortgage: MortgageTerms,
    todayISO: string,
): number | "never" {
    const useOverride =
        mortgage.currentBalance != null && mortgage.balanceAsOf != null;
    const from = useOverride ? mortgage.balanceAsOf! : mortgage.startDate;
    const start = useOverride
        ? mortgage.currentBalance!
        : mortgage.originalAmount;

    const elapsed = monthsBetween(from, todayISO);
    if (elapsed <= 0) return start;

    const result = amortize({
        balance: start,
        rate: mortgage.interestRate,
        payment: mortgage.piPayment,
    });
    if (result === "never") return "never";
    if (elapsed >= result.months) return 0;
    return result.schedule[elapsed - 1];
}

/**
 * Smallest recurring extra principal payment, in cents, that pays the loan off
 * within `targetMonths`. Returns null when the target is unreachable (it is
 * already met with no extra, or it is sooner than paying the whole balance at
 * once allows).
 */
export function solveExtraForMonths(
    opts: AmortizeOptions,
    targetMonths: number,
): number | null {
    if (targetMonths < 1) return null;

    const monthsWith = (extra: number): number | null => {
        const r = amortize({ ...opts, extra });
        return r === "never" ? null : r.months;
    };

    // A loan that never amortizes on its own can still be paid off with extra,
    // so a null base is not a dead end.
    const base = monthsWith(0);
    if (base != null && base <= targetMonths) return 0;

    let hi = opts.balance;
    if ((monthsWith(hi) ?? Infinity) > targetMonths) return null;

    // Binary search for the smallest extra that hits the target.
    let lo = 0;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if ((monthsWith(mid) ?? Infinity) <= targetMonths) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}

/** Format a month count as "12 yr 4 mo". */
export function formatTerm(months: number): string {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y === 0) return `${m} mo`;
    if (m === 0) return `${y} yr`;
    return `${y} yr ${m} mo`;
}

/**
 * The date of the final payment, given the date of the next payment and the
 * number of payments remaining. Month 1 is `nextPaymentISO` itself.
 */
export function payoffDate(nextPaymentISO: string, months: number): Date {
    const [y, m] = nextPaymentISO.split("-").map(Number);
    const total = y * 12 + (m - 1) + Math.max(0, months - 1);
    return new Date(Math.floor(total / 12), total % 12, 1);
}

/** Today as an ISO "YYYY-MM-DD" string in the local timezone. */
export function todayISO(date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** First day of the month following `date`, as ISO "YYYY-MM-DD". */
export function nextPaymentISO(date = new Date()): string {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    return m > 11
        ? `${y + 1}-01-01`
        : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}
