<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import InputCash from "$lib/components/InputCash.svelte";
  import InputTime from "$lib/components/InputTime.svelte";

  let initial = $state(null);
  let monthly = $state(null);
  let years = $state(null);
</script>

<Card header="Interest">
  {#snippet body()}
    <InputCash label="Initial Deposit" bind:value={initial} />
    <InputCash label="Monthly Contribution" bind:value={monthly} />
    <InputTime label="Number of years" bind:value={years} />
  {/snippet}
</Card>
