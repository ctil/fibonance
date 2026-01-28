<script lang="ts">
    import { deposit, DEFAULT_CONFIG } from "$lib/rebalance";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import InputCash from "$lib/components/InputCash.svelte";

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
    let rebalanceResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));
</script>

<div class="w-[260px] bg-white border border-cream-300 rounded-lg shadow-sm">
    <h3 class="px-6 py-4 border-b border-cream-300 text-center">Deposit</h3>
    <div class="px-6 pb-6">
        <InputCash label="Amount" bind:value={toDeposit} />
        {#each rebalanceResult.allocations as allocation}
            <div class="flex justify-between mb-2">
                <span class="w-[60px]"
                    ><b class="mr-3">{allocation.symbol}</b></span
                >
                <CopyCash cents={allocation.amount} />
            </div>
        {/each}
    </div>
</div>
