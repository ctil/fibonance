<script lang="ts">
	import { deposit, DEFAULT_CONFIG, formatAmount } from "$lib/rebalance";
	let toDeposit = $state(0);

	let toDepositCents = $derived(toDeposit * 100);
	let rebalanceResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));
</script>

<h1>Deposit</h1>
<div class="inputs">
	<label for="">Amount to Deposit</label>
	<input type="number" class="mb-4" bind:value={toDeposit} />

	{#each rebalanceResult.allocations as allocation}
		<div>
			<b>{allocation.symbol}:</b>
			{formatAmount(allocation.amount, true)}
		</div>
	{/each}
</div>

<style>
	.inputs {
		width: 300px;
	}
</style>
