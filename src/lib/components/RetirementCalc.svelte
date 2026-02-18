<script lang="ts">
    import { browser } from "$app/environment";
    import Card from "$lib/components/Card.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import { calculateRetirement, calculateRequiredSavings } from "$lib/retirement";
    import type { ClassValue } from "svelte/elements";

    const STORAGE_KEY = "retirement-calc";

    interface SavedRetirementData {
        currentValue?: number | null;
        annualSavings?: number | null;
        annualExpenses?: number | null;
        safeWithdrawalRate?: number | null;
        expectedRealReturn?: number | null;
        yearAdjustment?: number | null;
    }

    interface Props {
        class?: ClassValue;
        birthday?: string | null;
    }
    let { class: className, birthday = null }: Props = $props();

    // Load saved data from local storage
    function loadSaved(): SavedRetirementData {
        if (!browser) return {};
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (err) {
            console.error("Error loading saved retirement data:", err);
        }
        return {};
    }

    const saved = loadSaved();
    let currentValue = $state<number | null>(saved.currentValue ?? null);
    let annualSavings = $state<number | null>(saved.annualSavings ?? null);
    let annualExpenses = $state<number | null>(saved.annualExpenses ?? null);
    let safeWithdrawalRate = $state<number | null>(
        saved.safeWithdrawalRate ?? 4,
    );
    let expectedRealReturn = $state<number | null>(
        saved.expectedRealReturn ?? 6,
    );
    let yearAdjustment = $state<number>(saved.yearAdjustment ?? 5);

    $effect(() => {
        const data = {
            currentValue,
            annualSavings,
            annualExpenses,
            safeWithdrawalRate,
            expectedRealReturn,
            yearAdjustment,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });

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
                birthday,
            );
        }
        return null;
    });

    let savingsAdjustment = $derived.by(() => {
        if (result == null || typeof result !== "object") return null;
        const targetYears = result.yearsToRetirement + yearAdjustment;
        return calculateRequiredSavings(
            currentValue!,
            result.targetValue,
            expectedRealReturn!,
            targetYears,
        );
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
            <div
                class="mt-6 rounded-lg border border-green-200 bg-green-50 p-4"
            >
                <p class="text-2xl font-semibold text-green-600">
                    You can retire now!
                </p>
            </div>
        {:else if result === "impossible"}
            <div class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p class="text-2xl font-semibold text-red-600">
                    Cannot reach retirement target with current savings rate.
                </p>
            </div>
        {:else if result != null}
            <div
                class="mt-6 space-y-1 rounded-lg border border-green-200 bg-green-50 p-4"
            >
                <p class="text-lg">
                    <span class="font-bold">Target:</span>
                    {formatCurrency(result.targetValue)}
                </p>
                <p class="text-lg">
                    <span class="font-bold">Years to retirement:</span>
                    {result.yearsToRetirement.toFixed(1)} years
                </p>
                {#if result.retirementAge}
                    <p class="text-lg">
                        <span class="font-bold">Retirement age:</span>
                        {result.retirementAge.toFixed(1)}
                    </p>
                {/if}
                <p class="text-lg">
                    <span class="font-bold">Target date:</span>
                    {formatDate(result.retirementDate)}
                </p>
            </div>
            <div class="mt-4">
                <label class="mb-1 block text-sm font-medium text-gray-700">
                    Year adjustment
                    <input
                        type="number"
                        step="1"
                        bind:value={yearAdjustment}
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </label>
                <p class="mt-2 text-sm text-gray-700">
                    {#if yearAdjustment === 0}
                        No change
                    {:else if savingsAdjustment === "impossible"}
                        Target is not reachable in that timeframe.
                    {:else if savingsAdjustment != null}
                        {@const diff = savingsAdjustment - annualSavings!}
                        {yearAdjustment < 0
                            ? `To retire ${Math.abs(yearAdjustment)} year${Math.abs(yearAdjustment) === 1 ? "" : "s"} earlier`
                            : `To retire ${yearAdjustment} year${yearAdjustment === 1 ? "" : "s"} later`},
                        {#if diff > 0}
                            save <strong>+{formatCurrency(diff)}</strong> more per year ({formatCurrency(savingsAdjustment as number)}/yr)
                        {:else}
                            save <strong>{formatCurrency(Math.abs(diff))}</strong> less per year ({formatCurrency(savingsAdjustment as number)}/yr)
                        {/if}
                    {/if}
                </p>
            </div>
        {/if}
    {/snippet}
</Card>
