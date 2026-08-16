<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import Meter from "$lib/components/Meter.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
    import {
        calculateRetirement,
        calculateRequiredSavings,
        projectGrowth,
        CONTRIBUTIONS_PER_YEAR,
        formatCurrency,
        formatDate,
    } from "$lib/retirement";
    import type { PageData } from "./$types";
    import GrowthChart from "./GrowthChart.svelte";
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

    let projection = $derived.by(() => {
        if (result == null || typeof result !== "object") return null;
        const points = projectGrowth(
            currentValue!,
            annualSavings!,
            expectedRealReturn!,
            result.yearsToRetirement,
            result.targetValue,
        );
        if (points.length < 2) return null;
        const end = points[points.length - 1];
        return {
            points,
            contributed: end.contributed - currentValue!,
            growth: end.balance - end.contributed,
            years: end.year,
        };
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

    const dateSubtext = (years: number, age?: number | null) =>
        age != null
            ? `Age ${age.toFixed(1)} · in ${years.toFixed(1)} years`
            : `in ${years.toFixed(1)} years`;
</script>

<svelte:head>
    <title>Retirement - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Calculators"
    title="Retirement"
    description="How much you need, and when your savings get you there."
/>

<div class="flex flex-col gap-6 lg:flex-row">
    <!-- LEFT: inputs card -->
    <form
        method="POST"
        action="?/save"
        class="lg:w-80 lg:shrink-0"
        use:enhance={() => {
            saveState = "saving";
            return async ({ update }) => {
                await update({ reset: false });
                saveState = "saved";
                setTimeout(() => (saveState = "idle"), 2000);
            };
        }}
    >
        <input type="hidden" name="currentValue" value={currentValue ?? ""} />
        <input type="hidden" name="annualSavings" value={annualSavings ?? ""} />
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
        <Card header="Your numbers">
            {#snippet body()}
                <InputCash
                    label="Current portfolio value"
                    class="mb-4"
                    bind:value={currentValue}
                />
                <InputCash
                    label="Annual savings"
                    class="mb-4"
                    bind:value={annualSavings}
                />
                <InputCash
                    label="Annual retirement expenses"
                    class="mb-4"
                    bind:value={annualExpenses}
                />
                <InputPercent
                    label="Safe withdrawal rate (%)"
                    class="mb-4"
                    bind:value={safeWithdrawalRate}
                />
                <InputPercent
                    label="Expected real return (%)"
                    bind:value={expectedRealReturn}
                />
                {#if annualSavings != null || annualExpenses != null}
                    <dl
                        class="mt-5 space-y-1.5 border-t border-line-soft pt-4 text-sm"
                    >
                        {#if annualSavings != null}
                            <div class="flex justify-between gap-4">
                                <dt class="text-ink-faint">Monthly savings</dt>
                                <dd class="font-medium text-ink tabular-nums">
                                    {formatCurrency(annualSavings / 12)}
                                </dd>
                            </div>
                        {/if}
                        {#if annualExpenses != null}
                            <div class="flex justify-between gap-4">
                                <dt class="text-ink-faint">Monthly expenses</dt>
                                <dd class="font-medium text-ink tabular-nums">
                                    {formatCurrency(annualExpenses / 12)}
                                </dd>
                            </div>
                        {/if}
                    </dl>
                {/if}
                <Button
                    type="submit"
                    block
                    class="mt-5"
                    disabled={saveState === "saving"}
                >
                    {#if saveState === "saving"}
                        Saving…
                    {:else if saveState === "saved"}
                        Saved
                    {:else}
                        Save
                    {/if}
                </Button>
            {/snippet}
        </Card>
    </form>

    <!-- RIGHT: results -->
    <div class="min-w-0 flex-1">
        {#if result === "already"}
            <ResultBanner variant="success">
                <p class="type-display text-3xl text-accent">
                    You can retire now.
                </p>
            </ResultBanner>
        {:else if result === "impossible"}
            <ResultBanner variant="error">
                <p class="type-display text-2xl text-danger">
                    This savings rate never reaches the target.
                </p>
            </ResultBanner>
        {:else if result != null}
            {@const progress = Math.min(
                100,
                (currentValue! / result.targetValue) * 100,
            )}
            <div class="space-y-4">
                <Card>
                    {#snippet body()}
                        <Meter
                            label="Progress to goal"
                            value="{progress.toFixed(1)}%"
                            percent={progress}
                            startCaption={formatCurrency(currentValue!)}
                            endCaption={formatCurrency(result.targetValue)}
                        />
                    {/snippet}
                </Card>

                <div class="grid gap-4 sm:grid-cols-2">
                    <StatCard
                        label="Target portfolio"
                        value={formatCurrency(result.targetValue)}
                        subtext={inflationAdjustedTarget != null
                            ? `${formatCurrency(inflationAdjustedTarget)} nominal (3% inflation)`
                            : undefined}
                    />
                    <StatCard
                        label="Years to retirement"
                        value={result.yearsToRetirement.toFixed(1)}
                        subtext="years"
                    />
                    <StatCard
                        label="Target date"
                        value={formatDate(result.retirementDate)}
                        subtext={dateSubtext(
                            result.yearsToRetirement,
                            result.retirementAge,
                        )}
                    />

                    <div
                        class="rounded-surface border border-line bg-surface p-5 shadow-surface"
                    >
                        <label class="type-eyebrow" for="year-adjustment">
                            Shift retirement by (years)
                        </label>
                        <input
                            id="year-adjustment"
                            type="number"
                            step="1"
                            bind:value={yearAdjustment}
                            class="type-display mt-1.5 mb-2 w-24 px-3 text-3xl tabular-nums"
                        />
                        <p class="text-sm text-ink-muted">
                            {#if yearAdjustment === 0}
                                No change to the target date.
                            {:else if savingsAdjustment === "impossible"}
                                Target is not reachable in that timeframe.
                            {:else if savingsAdjustment != null}
                                {@const diff =
                                    savingsAdjustment - annualSavings!}
                                {yearAdjustment < 0
                                    ? `To retire ${Math.abs(yearAdjustment)} year${Math.abs(yearAdjustment) === 1 ? "" : "s"} earlier`
                                    : `To retire ${yearAdjustment} year${yearAdjustment === 1 ? "" : "s"} later`},
                                save
                                <!-- "more"/"less" already carries the
                                     direction, so the figure is unsigned. -->
                                <span
                                    class={[
                                        "font-medium tabular-nums",
                                        diff > 0
                                            ? "text-attention"
                                            : "text-accent",
                                    ]}
                                >
                                    {formatCurrency(Math.abs(diff))}
                                </span>
                                {diff > 0 ? "more" : "less"} per year ({formatCurrency(
                                    savingsAdjustment,
                                )} a year).
                            {/if}
                        </p>
                    </div>
                </div>

                {#if projection != null}
                    <Card header="Projected growth">
                        {#snippet body()}
                            <GrowthChart
                                points={projection.points}
                                targetValue={result.targetValue}
                            />
                            <p
                                class="mt-4 border-t border-line-soft pt-4 text-sm text-ink-muted"
                            >
                                Contributing
                                <span class="font-medium text-ink tabular-nums">
                                    {formatCurrency(
                                        annualSavings! / CONTRIBUTIONS_PER_YEAR,
                                    )}
                                </span>
                                every two weeks, you add
                                <span class="font-medium text-ink tabular-nums">
                                    {formatCurrency(projection.contributed)}
                                </span>
                                of your own money over {projection.years.toFixed(
                                    1,
                                )} years and earn
                                <span
                                    class="font-medium text-accent tabular-nums"
                                >
                                    {formatCurrency(projection.growth)}
                                </span>
                                in real growth.
                                <!-- Biweekly money compounds sooner than the
                                     year-end lump the headline figures assume,
                                     so the two dates differ slightly. -->
                                {#if projection.years < result.yearsToRetirement - 0.05}
                                    Because the money goes in through the year
                                    rather than at each year's end, that is
                                    about {(
                                        result.yearsToRetirement -
                                        projection.years
                                    ).toFixed(1)} years sooner than the date above.
                                {/if}
                            </p>
                        {/snippet}
                    </Card>
                {/if}

                {#if coastFireResult != null}
                    <section class="pt-2">
                        <h2 class="type-eyebrow mb-2">Coast FIRE</h2>
                        {#if coastFireResult === "already"}
                            <div
                                class="rounded-surface border border-accent-line bg-accent-soft p-4"
                            >
                                <p class="font-medium text-accent">
                                    You have already reached Coast FIRE.
                                </p>
                            </div>
                        {:else if coastFireResult === "impossible"}
                            <div
                                class="rounded-surface border border-danger-line bg-danger-soft p-4"
                            >
                                <p class="text-danger">
                                    Coast FIRE needs a positive expected return
                                    rate.
                                </p>
                            </div>
                        {:else}
                            <div class="grid gap-4 sm:grid-cols-2">
                                <StatCard
                                    label="Coast FIRE date"
                                    value={formatDate(
                                        coastFireResult.retirementDate,
                                    )}
                                    subtext={dateSubtext(
                                        coastFireResult.yearsToRetirement,
                                        coastFireResult.retirementAge,
                                    )}
                                />
                                <div
                                    class="flex items-center rounded-surface border border-dashed border-line p-5 text-sm text-ink-muted"
                                >
                                    The date your current savings coast to the
                                    target on their own, with nothing more
                                    added.
                                </div>
                            </div>
                        {/if}
                    </section>
                {/if}
            </div>
        {:else}
            <ResultBanner variant="empty">
                <p class="text-ink-faint">
                    Fill in the inputs to see your retirement projection.
                </p>
            </ResultBanner>
        {/if}
    </div>
</div>
