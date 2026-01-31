<script lang="ts">
    import DepositAllocation from "$lib/components/DepositAllocation.svelte";
    import InputCash from "$lib/components/InputCash.svelte";

    let { data } = $props();

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);
</script>

<InputCash class="mb-5 w-[200px]" label="Amount" bind:value={toDeposit} />

<div class="flex flex-col md:flex-row gap-3">
    {#each data.portfolios as portfolio}
        <DepositAllocation
            class="w-full md:w-[260px]"
            title={portfolio.name}
            config={portfolio.config}
            depositCents={toDepositCents}
        />
    {/each}
</div>
