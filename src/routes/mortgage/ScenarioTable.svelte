<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import {
        amortize,
        formatTerm,
        payoffDate,
        type AmortizeOptions,
    } from "$lib/mortgage";
    import { formatCurrency, formatDate } from "$lib/retirement";

    interface Props {
        /** Loan terms with no extra payment applied. */
        loan: AmortizeOptions;
        /** The user's current extra payment, cents. Highlighted in the table. */
        extra: number;
        /** Date of the next scheduled payment, ISO. */
        nextPayment: string;
        class?: ClassValue;
    }

    let { loan, extra, nextPayment, class: className }: Props = $props();

    const PRESETS = [0, 100, 200, 300, 500, 750, 1000].map((d) => d * 100);

    const baseline = $derived(amortize({ ...loan, extra: 0 }));

    const rows = $derived.by(() => {
        const amounts = [...new Set([...PRESETS, extra])].sort((a, b) => a - b);
        return amounts.map((amount) => {
            const result = amortize({ ...loan, extra: amount });
            if (result === "never" || baseline === "never") {
                return {
                    amount,
                    months: null,
                    savedMonths: 0,
                    savedInterest: 0,
                };
            }
            return {
                amount,
                months: result.months,
                savedMonths: baseline.months - result.months,
                savedInterest: baseline.totalInterest - result.totalInterest,
            };
        });
    });
</script>

<div class={["overflow-x-auto", className]}>
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-line text-left">
                <th class="type-eyebrow py-3 pr-4">Extra / mo</th>
                <th class="type-eyebrow py-3 pr-4">Payoff</th>
                <th class="type-eyebrow py-3 pr-4">Done by</th>
                <th class="type-eyebrow py-3 pr-4">Time saved</th>
                <th class="type-eyebrow py-3 pr-4 text-right">Interest saved</th
                >
            </tr>
        </thead>
        <tbody class="divide-y divide-line-soft">
            {#each rows as row (row.amount)}
                <tr class={row.amount === extra ? "bg-accent-soft" : ""}>
                    <td class="py-2.5 pr-4 font-medium whitespace-nowrap">
                        {formatCurrency(row.amount / 100)}
                        {#if row.amount === extra}
                            <span
                                class="ml-2 rounded-control bg-accent px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-cream-50 uppercase"
                                >you</span
                            >
                        {/if}
                    </td>
                    <td class="py-2.5 pr-4 whitespace-nowrap">
                        {row.months == null ? "—" : formatTerm(row.months)}
                    </td>
                    <td class="py-2.5 pr-4 whitespace-nowrap">
                        {row.months == null
                            ? "—"
                            : formatDate(payoffDate(nextPayment, row.months))}
                    </td>
                    <td class="py-2.5 pr-4 whitespace-nowrap">
                        {row.savedMonths > 0
                            ? formatTerm(row.savedMonths)
                            : "—"}
                    </td>
                    <td
                        class="py-2.5 pr-4 text-right whitespace-nowrap text-ink-faint"
                    >
                        {#if row.savedInterest > 0}
                            <span class="value-positive"
                                >{formatCurrency(row.savedInterest / 100)}</span
                            >
                        {:else}
                            —
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
