<script lang="ts">
	import { deposit, DEFAULT_CONFIG } from "$lib/rebalance";
	import CopyCash from "$lib/components/CopyCash.svelte";
	import InputCash from "$lib/components/InputCash.svelte";

	let toDeposit = $state(null);
	let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
	let rebalanceResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));
</script>

<div class="inputs card">
	<h3 class="card-header text-center">Deposit</h3>
	<div class="card-body">
		<InputCash label="Amount" bind:value={toDeposit} />
		{#each rebalanceResult.allocations as allocation}
			<div class="allocation mb-2">
				<span
					><b class="mr-3">{allocation.symbol}</b
					></span
				>
				<CopyCash cents={allocation.amount} />
			</div>
		{/each}
	</div>
</div>

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
