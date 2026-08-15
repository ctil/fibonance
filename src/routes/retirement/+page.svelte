<script lang="ts">
    import { enhance } from "$app/forms";
    import Card from "$lib/components/Card.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
    import {
        calculateRetirement,
        calculateRequiredSavings,
        formatCurrency,
    } from "$lib/retirement";
    import type { PageData } from "./$types";
    import DateCard from "./DateCard.svelte";
    import ResultBanner from "./ResultBanner.svelte";

    const { data }: { data: PageData } = $props();
    const birthday = $derived(data.user?.birthday ?? null);

    const initial = (() => {
        const s = data.scenario;
        const c = (v: number | null | undefined) =>
            v != null ? v / 100 : null;
        return {
            currentValue: c(s?.currentValue),
            annualSavings: c(s?.annualSavings),
            annualExpenses: c(s?.annualExpenses),
            safeWithdrawalRate: c(s?.safeWithdrawalRate) ?? 4,
            expectedRealReturn: c(s?.expectedRealReturn) ?? 6,
            yearAdjustment: s?.yearAdjustment ?? 5,
        };
    })();
    let currentValue = $state<number | null>(initial.currentValue);
    let annualSavings = $state<number | null>(initial.annualSavings);
    let annualExpenses = $state<number | null>(initial.annualExpenses);
    let safeWithdrawalRate = $state<number | null>(initial.safeWithdrawalRate);
    let expectedRealReturn = $state<number | null>(initial.expectedRealReturn);
    let yearAdjustment = $state<number>(initial.yearAdjustment);
    let saveState = $state<"idle" | "saving" | "saved">("idle");

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

    let coastFireResult = $derived.by(() => {
        if (result == null || typeof result !== "object") return null;
        return calculateRetirement(
            currentValue!,
            0,
            annualExpenses!,
            safeWithdrawalRate!,
            expectedRealReturn!,
            birthday,
        );
    });

    let inflationAdjustedTarget = $derived(
        result != null && typeof result === "object"
            ? result.targetValue * Math.pow(1.03, result.yearsToRetirement)
            : null,
    );

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
</script>

<div class="w-full">
    <h1 class="text-2xl font-semibold mb-6">Retirement Calculator</h1>

    <div class="flex flex-col lg:flex-row gap-6">
        <!-- LEFT: inputs card -->
        <form
            method="POST"
            action="?/save"
            use:enhance={() => {
                saveState = "saving";
                return async ({ update }) => {
                    await update({ reset: false });
                    saveState = "saved";
                    setTimeout(() => (saveState = "idle"), 2000);
                };
            }}
        >
            <input
                type="hidden"
                name="currentValue"
                value={currentValue ?? ""}
            />
            <input
                type="hidden"
                name="annualSavings"
                value={annualSavings ?? ""}
            />
            <input
                type="hidden"
                name="annualExpenses"
                value={annualExpenses ?? ""}
            />
            <input
                type="hidden"
                name="safeWithdrawalRate"
                value={safeWithdrawalRate ?? ""}
            />
            <input
                type="hidden"
                name="expectedRealReturn"
                value={expectedRealReturn ?? ""}
            />
            <input type="hidden" name="yearAdjustment" value={yearAdjustment} />
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
                    {#if annualSavings != null || annualExpenses != null}
                        <div
                            class="mt-5 pt-4 border-t border-cream-200 text-sm text-cream-700 space-y-1"
                        >
                            {#if annualSavings != null}
                                <p>
                                    Monthly savings: <span
                                        class="font-medium text-gray-900"
                                        >{formatCurrency(
                                            annualSavings / 12,
                                        )}</span
                                    >
                                </p>
                            {/if}
                            {#if annualExpenses != null}
                                <p>
                                    Monthly expenses: <span
                                        class="font-medium text-gray-900"
                                        >{formatCurrency(
                                            annualExpenses / 12,
                                        )}</span
                                    >
                                </p>
                            {/if}
                        </div>
                    {/if}
                    <button
                        type="submit"
                        disabled={saveState === "saving"}
                        class="mt-4 w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors {saveState ===
                        'saved'
                            ? 'bg-green-600'
                            : 'bg-blue-600 hover:bg-blue-700'}"
                    >
                        {#if saveState === "saving"}
                            Saving...
                        {:else if saveState === "saved"}
                            Saved!
                        {:else}
                            Save
                        {/if}
                    </button>
                {/snippet}
            </Card>
        </form>

        <!-- RIGHT: results -->
        <div class="flex-1 min-w-0">
            {#if result === "already"}
                <ResultBanner variant="success">
                    <p class="text-3xl font-semibold text-green-600">
                        You can retire now.
                    </p>
                </ResultBanner>
            {:else if result === "impossible"}
                <ResultBanner variant="error">
                    <p class="text-2xl font-semibold text-red-600">
                        Cannot reach retirement target with current savings
                        rate.
                    </p>
                </ResultBanner>
            {:else if result != null}
                {@const progress = Math.min(
                    100,
                    (currentValue! / result.targetValue) * 100,
                )}
                <div
                    class="bg-white border border-cream-300 rounded-lg shadow-sm p-5 mb-4"
                >
                    <div class="flex justify-between text-sm mb-2">
                        <span
                            class="font-medium text-cream-600 uppercase tracking-wide text-xs"
                            >Progress to Goal</span
                        >
                        <span class="font-semibold">{progress.toFixed(1)}%</span
                        >
                    </div>
                    <div class="w-full bg-cream-100 rounded-full h-3">
                        <div
                            class="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style="width: {progress}%"
                        ></div>
                    </div>
                    <div
                        class="flex justify-between text-xs text-cream-500 mt-1"
                    >
                        <span>{formatCurrency(currentValue!)}</span>
                        <span>{formatCurrency(result.targetValue)}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <StatCard
                        label="Target Portfolio"
                        value={formatCurrency(result.targetValue)}
                        subtext={inflationAdjustedTarget != null
                            ? `${formatCurrency(inflationAdjustedTarget)} nominal (3% inflation)`
                            : undefined}
                    />
                    <StatCard
                        label="Years to Retirement"
                        value={result.yearsToRetirement.toFixed(1)}
                        subtext="years"
                    />
                    <DateCard
                        label="Target Date"
                        date={result.retirementDate}
                        years={result.yearsToRetirement}
                        age={result.retirementAge}
                    />
                    <div
                        class="bg-white border border-cream-300 rounded-lg shadow-sm p-5"
                    >
                        <p
                            class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1"
                        >
                            Year Adjustment
                        </p>
                        <label class="sr-only" for="year-adjustment"
                            >Year adjustment</label
                        >
                        <input
                            id="year-adjustment"
                            type="number"
                            step="1"
                            bind:value={yearAdjustment}
                            class="block w-24 rounded-md border border-gray-300 px-3 py-2 text-3xl font-bold focus:border-blue-500 focus:outline-none mb-2"
                        />
                        <p class="text-gray-700 text-md">
                            {#if yearAdjustment === 0}
                                No change
                            {:else if savingsAdjustment === "impossible"}
                                Target is not reachable in that timeframe.
                            {:else if savingsAdjustment != null}
                                {@const diff =
                                    savingsAdjustment - annualSavings!}
                                {yearAdjustment < 0
                                    ? `To retire ${Math.abs(yearAdjustment)} year${Math.abs(yearAdjustment) === 1 ? "" : "s"} earlier`
                                    : `To retire ${yearAdjustment} year${yearAdjustment === 1 ? "" : "s"} later`},
                                save
                                <span
                                    class={diff > 0
                                        ? "text-red-600"
                                        : "text-green-600"}
                                >
                                    {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                                </span>
                                {diff > 0 ? "more" : "less"} per year ({formatCurrency(
                                    savingsAdjustment,
                                )})
                            {/if}
                        </p>
                    </div>
                </div>
                {#if coastFireResult != null}
                    <div class="mb-4">
                        <p
                            class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-2"
                        >
                            Coast FIRE
                        </p>
                        {#if coastFireResult === "already"}
                            <div
                                class="rounded-lg border border-green-200 bg-green-50 p-4"
                            >
                                <p class="text-green-700 font-medium">
                                    You've already reached Coast FIRE.
                                </p>
                            </div>
                        {:else if coastFireResult === "impossible"}
                            <div
                                class="rounded-lg border border-red-200 bg-red-50 p-4"
                            >
                                <p class="text-red-700">
                                    Coast FIRE requires a positive expected
                                    return rate.
                                </p>
                            </div>
                        {:else}
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DateCard
                                    label="Coast FIRE Date"
                                    date={coastFireResult.retirementDate}
                                    years={coastFireResult.yearsToRetirement}
                                    age={coastFireResult.retirementAge}
                                />
                            </div>
                        {/if}
                    </div>
                {/if}
            {:else}
                <ResultBanner variant="empty">
                    <p class="text-cream-500">
                        Fill in the inputs to see your retirement projection.
                    </p>
                </ResultBanner>
            {/if}
        </div>
    </div>
</div>
