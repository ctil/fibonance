<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import InputCash from "$lib/components/InputCash.svelte";
  import InputTime from "$lib/components/InputTime.svelte";
  import { DEFAULT_CONFIG, deposit } from "$lib/rebalance";

  let toDeposit = $state(null);
  let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
  let rebalanceResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));

  // TODO: have multiple different deposit types and have it be a page
</script>

<h3 class="card-header text-center">Deposit</h3>
<div class="card-body">
  <InputCash label="Amount" bind:value={toDeposit} />
  {#each rebalanceResult.allocations as allocation}
    <div class="allocation mb-2">
      <span><b class="mr-3">{allocation.symbol}</b></span>
      <CopyCash cents={allocation.amount} />
    </div>
  {/each}
</div>

<Card header="Deposit">
  {#snippet body()}
    <InputCash label="Initial Deposit" bind:value={initial} />
    <InputCash label="Monthly Contribution" bind:value={monthly} />
    <InputTime label="Number of years" bind:value={years} />
  {/snippet}
</Card>
