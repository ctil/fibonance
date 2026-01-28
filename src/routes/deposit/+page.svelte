<script lang="ts">
    import { DEFAULT_CONFIG, INDEXES_ONLY, NO_BONDS } from "$lib/rebalance";
    import DepositAllocation from "$lib/components/DepositAllocation.svelte";
    import InputCash from "$lib/components/InputCash.svelte";

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
</script>

<InputCash class="mb-5" label="Amount" bind:value={toDeposit} />

<div class="flex">
    <DepositAllocation
        class="w-[260px] m-3"
        title="No Bonds"
        config={NO_BONDS}
        depositCents={toDepositCents}
    />
    <DepositAllocation
        class="w-[260px] m-3"
        title="Indexes only"
        config={INDEXES_ONLY}
        depositCents={toDepositCents}
    />
    <DepositAllocation
        class="w-[260px] m-3"
        title="Full Portfolio"
        config={DEFAULT_CONFIG}
        depositCents={toDepositCents}
    />
</div>
