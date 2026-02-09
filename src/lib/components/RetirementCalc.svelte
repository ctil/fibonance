<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import { calculateRetirement } from "$lib/retirement";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        class?: ClassValue;
    }
    let { class: className }: Props = $props();

    let currentValue = $state<number | null>(null);
    let annualSavings = $state<number | null>(null);
    let annualExpenses = $state<number | null>(null);
    let safeWithdrawalRate = $state<number | null>(4);
    let expectedRealReturn = $state<number | null>(6);

    let result = $derived.by(() => {
        if (
            currentValue != null &&
            annualSavings != null &&
            annualExpenses != null &&
            safeWithdrawalRate != null &&
            expectedRealReturn != null &&
            annualExpenses > 0 &&
            safeWithdrawalRate > 0
        ) {
            return calculateRetirement(
                currentValue,
                annualSavings,
                annualExpenses,
                safeWithdrawalRate,
                expectedRealReturn,
            );
        }
        return null;
    });

    function formatCurrency(value: number): string {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }
</script>

<Card header="Retirement" class={className}>
    {#snippet body()}
        <InputCash
            label="Current Portfolio Value"
            class="mb-4"
            bind:value={currentValue}
        />
        <InputCash
            label="Annual Savings"
            class="mb-4"
            bind:value={annualSavings}
        />
        <InputCash
            label="Annual Retirement Expenses"
            class="mb-4"
            bind:value={annualExpenses}
        />
        <InputPercent
            label="Safe Withdrawal Rate (%)"
            class="mb-4"
            bind:value={safeWithdrawalRate}
        />
        <InputPercent
            label="Expected Real Return (%)"
            class="mb-4"
            bind:value={expectedRealReturn}
        />
        {#if result === "already"}
            <p class="text-lg font-semibold text-green-600">
                You can retire now!
            </p>
        {:else if result === "impossible"}
            <p class="text-lg font-semibold text-red-600">
                Cannot reach retirement target with current savings rate.
            </p>
        {:else if result != null}
            <div class="space-y-1">
                <p>
                    <span class="font-medium">Target:</span>
                    {formatCurrency(result.targetValue)}
                </p>
                <p>
                    <span class="font-medium">Years to retirement:</span>
                    {result.yearsToRetirement.toFixed(1)} years
                </p>
                <p>
                    <span class="font-medium">Target date:</span>
                    {formatDate(result.retirementDate)}
                </p>
            </div>
        {/if}
    {/snippet}
</Card>
