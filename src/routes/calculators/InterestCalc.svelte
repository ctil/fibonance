<script lang="ts">
    import { browser } from "$app/environment";
    import Card from "$lib/components/Card.svelte";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import Field from "$lib/components/Field.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import Meter from "$lib/components/Meter.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
    import InputTime from "./InputTime.svelte";
    import { calculateInterest, type CompoundFrequency } from "$lib/compound";
    import { formatAmount } from "$lib/rebalance";
    import type { ClassValue } from "svelte/elements";

    const STORAGE_KEY = "interest-calc";

    interface SavedInterestData {
        initial?: number | null;
        monthly?: number | null;
        rate?: number | null;
        years?: number | null;
        frequency?: CompoundFrequency;
    }

    interface Props {
        class?: ClassValue;
    }
    let { class: className }: Props = $props();

    function loadSaved(): SavedInterestData {
        if (!browser) return {};
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (err) {
            console.error("Error loading saved interest data:", err);
        }
        return {};
    }

    const saved = loadSaved();
    let initial = $state<number | null>(saved.initial ?? null);
    let monthly = $state<number | null>(saved.monthly ?? null);
    let rate = $state<number | null>(saved.rate ?? null);
    let years = $state<number | null>(saved.years ?? null);
    let frequency = $state<CompoundFrequency>(saved.frequency ?? "annually");

    $effect(() => {
        const data = { initial, monthly, rate, years, frequency };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    });

    let result = $derived.by(() => {
        if (
            initial != null &&
            monthly != null &&
            rate != null &&
            years != null
        ) {
            return calculateInterest(
                initial * 100,
                monthly * 100,
                rate,
                years,
                frequency,
            );
        }
        return null;
    });

    // What you put in versus what the compounding added — the whole point of
    // the calculator, and previously left for the reader to work out.
    let contributed = $derived(
        initial == null || monthly == null || years == null
            ? null
            : Math.round(initial * 100 + monthly * 100 * 12 * years),
    );
    let growth = $derived(
        result == null || contributed == null ? null : result - contributed,
    );
    let growthShare = $derived(
        result == null || growth == null || result <= 0
            ? 0
            : (growth / result) * 100,
    );
</script>

<div
    class={[
        "grid items-start gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]",
        className,
    ]}
>
    <Card header="Inputs">
        {#snippet body()}
            <InputCash
                label="Initial deposit"
                class="mb-4"
                bind:value={initial}
            />
            <InputCash
                label="Monthly contribution"
                class="mb-4"
                bind:value={monthly}
            />
            <InputPercent
                label="Annual rate (%)"
                class="mb-4"
                bind:value={rate}
            />
            <InputTime
                label="Number of years"
                class="mb-4"
                bind:value={years}
            />
            <Field label="Compound frequency">
                {#snippet control(id)}
                    <select {id} class="px-3" bind:value={frequency}>
                        <option value="annually">Annually</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="monthly">Monthly</option>
                        <option value="daily">Daily</option>
                    </select>
                {/snippet}
            </Field>
        {/snippet}
    </Card>

    {#if result != null && contributed != null && growth != null}
        <div class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2">
                <StatCard
                    label="Final balance"
                    value={formatAmount(result, true)}
                />
                <StatCard
                    label="Interest earned"
                    value={formatAmount(growth, true)}
                    tone="positive"
                    subtext="on {formatAmount(contributed, true)} contributed"
                />
            </div>

            <Card>
                {#snippet body()}
                    <Meter
                        label="Interest share of final balance"
                        value="{growthShare.toFixed(1)}%"
                        percent={growthShare}
                        startCaption="Contributed {formatAmount(
                            contributed,
                            true,
                        )}"
                        endCaption="Interest {formatAmount(growth, true)}"
                    />
                    <div
                        class="mt-5 flex items-center justify-between border-t border-line-soft pt-4"
                    >
                        <span class="text-sm text-ink-muted">Final balance</span
                        >
                        <CopyCash cents={result} />
                    </div>
                {/snippet}
            </Card>
        </div>
    {:else}
        <div
            class="flex min-h-48 items-center justify-center rounded-surface border border-dashed border-line p-8 text-center text-sm text-ink-faint"
        >
            Fill in all four values to see what the balance grows to.
        </div>
    {/if}
</div>
