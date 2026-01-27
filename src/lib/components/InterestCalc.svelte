<script lang="ts">
import Card from "$lib/components/Card.svelte";
import CopyCash from "$lib/components/CopyCash.svelte";
import InputCash from "$lib/components/InputCash.svelte";
import InputPercent from "$lib/components/InputPercent.svelte";
import InputTime from "$lib/components/InputTime.svelte";
import { calculateInterest, type CompoundFrequency } from "$lib/compound";

let initial = $state<number | null>(null);
let monthly = $state<number | null>(null);
let rate = $state<number | null>(null);
let years = $state<number | null>(null);
let frequency = $state<CompoundFrequency>("annually");

let result = $derived.by(() => {
    if (initial != null && monthly != null && rate != null && years != null) {
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

<Card header="Interest">
  {#snippet body()}
    <InputCash label="Initial Deposit" bind:value={initial} />
    <InputCash label="Monthly Contribution" bind:value={monthly} />
    <InputPercent label="Annual Rate (%)" bind:value={rate} />
    <InputTime label="Number of years" bind:value={years} />
    <label>
      Compound Frequency
      <select bind:value={frequency}>
        <option value="annually">Annually</option>
        <option value="quarterly">Quarterly</option>
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
      </select>
    </label>
    {#if result != null}
      <p>Result: <CopyCash cents={result} /></p>
    {/if}
  {/snippet}
</Card>
