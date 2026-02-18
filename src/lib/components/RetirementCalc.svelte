<script lang="ts">
    import { browser } from "$app/environment";
    import Card from "$lib/components/Card.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import {
        calculateRetirement,
        calculateRequiredSavings,
    } from "$lib/retirement";
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

<div class={["w-full", className]}>
    <h1 class="text-2xl font-semibold mb-6">Retirement Calculator</h1>

    <div class="flex flex-col lg:flex-row gap-6">
        <!-- LEFT: inputs card -->
        <Card class="lg:w-80 shrink-0">
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
                    bind:value={expectedRealReturn}
                />
            {/snippet}
        </Card>

        <!-- RIGHT: results -->
        <div class="flex-1 min-w-0">
            {#if result === "already"}
                <div
                    class="rounded-lg border border-green-200 bg-green-50 p-8 flex items-center justify-center min-h-48"
                >
                    <p class="text-3xl font-semibold text-green-600">
                        You can retire now.
                    </p>
                </div>
            {:else if result === "impossible"}
                <div
                    class="rounded-lg border border-red-200 bg-red-50 p-8 flex items-center justify-center min-h-48"
                >
                    <p class="text-2xl font-semibold text-red-600">
                        Cannot reach retirement target with current savings
                        rate.
                    </p>
                </div>
            {:else if result != null}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div
                        class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                    >
                        <p
                            class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1"
                        >
                            Target Portfolio
                        </p>
                        <p class="text-3xl font-bold">
                            {formatCurrency(result.targetValue)}
                        </p>
                    </div>
                    <div
                        class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                    >
                        <p
                            class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1"
                        >
                            Years to Retirement
                        </p>
                        <p class="text-3xl font-bold">
                            {result.yearsToRetirement.toFixed(1)}
                        </p>
                        <p class="text-sm text-cream-600 mt-1">years</p>
                    </div>
                    <div
                        class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                    >
                        <p
                            class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1"
                        >
                            Target Date
                        </p>
                        <p class="text-3xl font-bold">
                            {formatDate(result.retirementDate)}
                        </p>
                    </div>
                    {#if result.retirementAge}
                        <div
                            class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                        >
                            <p
                                class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1"
                            >
                                Retirement Age
                            </p>
                            <p class="text-3xl font-bold">
                                {result.retirementAge.toFixed(1)}
                            </p>
                        </div>
                    {/if}
                </div>

                <div
                    class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                >
                    <label class="mb-1 block text-sm font-medium text-gray-700">
                        Year adjustment
                        <input
                            type="number"
                            style="width: 100px"
                            step="1"
                            bind:value={yearAdjustment}
                            class="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </label>
                    <p class="mt-2 text-gray-700 text-md">
                        {#if yearAdjustment === 0}
                            No change
                        {:else if savingsAdjustment === "impossible"}
                            Target is not reachable in that timeframe.
                        {:else if savingsAdjustment != null}
                            {@const diff = savingsAdjustment - annualSavings!}
                            {yearAdjustment < 0
                                ? `To retire ${Math.abs(yearAdjustment)} year${Math.abs(yearAdjustment) === 1 ? "" : "s"} earlier`
                                : `To retire ${yearAdjustment} year${yearAdjustment === 1 ? "" : "s"} later`},
                            save {formatCurrency(savingsAdjustment)}/yr (<span
                                class={diff > 0
                                    ? "text-red-600"
                                    : "text-green-600"}
                            >
                                {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                            </span>)
                        {/if}
                    </p>
                </div>
            {:else}
                <div
                    class="rounded-lg border border-cream-300 bg-cream-50 p-8 flex items-center justify-center min-h-48"
                >
                    <p class="text-cream-500">
                        Fill in the inputs to see your retirement projection.
                    </p>
                </div>
            {/if}
        </div>
    </div>
</div>
