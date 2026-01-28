<script lang="ts">
    import {
        deposit,
        DEFAULT_CONFIG,
        INDEXES_ONLY,
        NO_BONDS,
    } from "$lib/rebalance";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import Card from "$lib/components/Card.svelte";

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
    let fullResult = $derived(deposit(DEFAULT_CONFIG, toDepositCents));
    let indexesResult = $derived(deposit(INDEXES_ONLY, toDepositCents));
    let noBondsResult = $derived(deposit(NO_BONDS, toDepositCents));
</script>

<InputCash class="mb-5" label="Deposit Amount" bind:value={toDeposit} />

<Card class="w-[260px]" header="Full Portfolio">
    {#snippet body()}
        {#each fullResult.allocations as allocation}
            <div class="flex justify-between mb-2">
                <span class="w-[60px]"
                    ><b class="mr-3">{allocation.symbol}</b></span
                >
                <CopyCash cents={allocation.amount} />
            </div>
        {/each}
    {/snippet}
</Card>

<Card class="w-[260px]" header="Index funds only">
    {#snippet body()}
        {#each indexesResult.allocations as allocation}
            <div class="flex justify-between mb-2">
                <span class="w-[60px]"
                    ><b class="mr-3">{allocation.symbol}</b></span
                >
                <CopyCash cents={allocation.amount} />
            </div>
        {/each}
    {/snippet}
</Card>

<Card class="w-[260px]" header="No Bonds">
    {#snippet body()}
        {#each noBondsResult.allocations as allocation}
            <div class="flex justify-between mb-2">
                <span class="w-[60px]"
                    ><b class="mr-3">{allocation.symbol}</b></span
                >
                <CopyCash cents={allocation.amount} />
            </div>
        {/each}
    {/snippet}
</Card>
