<script lang="ts">
	import { deposit, DEFAULT_CONFIG, formatAmount } from "$lib/rebalance";
	import CopyText from "$lib/components/CopyText.svelte";
	import InputCash from "$lib/components/InputCash.svelte";

	let toDeposit = $state(null);
	let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
	let rebalanceResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));
</script>

<h3>Deposit</h3>
<div class="inputs">
	<InputCash label="Amount to deposit" bind:value={toDeposit} />

	{#each rebalanceResult.allocations as allocation}
		<div class="allocation mb-2">
			<span><b class="mr-3">{allocation.symbol}</b></span>
			<CopyText
				text={formatAmount(allocation.amount)}
				displayText={formatAmount(allocation.amount, true)}
			/>
		</div>
	{/each}
</div>

<h3>Rebalance</h3>

<style>
	span {
		width: 60px;
	}
	.inputs {
		width: 260px;
	}
	.allocation {
		display: flex;
		justify-content: space-between;
	}
</style>
