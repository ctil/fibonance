<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import InputTime from "$lib/components/InputTime.svelte";
    import { calculateInterest, type CompoundFrequency } from "$lib/compound";
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
</script>

<Card header="Interest" class={className}>
    {#snippet body()}
        <InputCash label="Initial Deposit" class="mb-4" bind:value={initial} />
        <InputCash
            label="Monthly Contribution"
            class="mb-4"
            bind:value={monthly}
        />
        <InputPercent label="Annual Rate (%)" class="mb-4" bind:value={rate} />
        <InputTime label="Number of years" class="mb-4" bind:value={years} />
        <div class="mb-4">
            <label for="compound-frequency"> Compound Frequency </label>
            <select id="compound-frequency" class="px-3" bind:value={frequency}>
                <option value="annually">Annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
            </select>
        </div>
        {#if result != null}
            <CopyCash cents={result} />
        {/if}
    {/snippet}
</Card>
