<script lang="ts">
    import DepositAllocation from "$lib/components/DepositAllocation.svelte";
    import InputCash from "$lib/components/InputCash.svelte";

    let { data } = $props();

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);

    let selectedPortfolioId: number | null = $state(null);
    let selectedPortfolio = $derived(
        data.portfolios.find((p) => p.id === selectedPortfolioId) ?? null,
    );

    $effect(() => {
        if (selectedPortfolioId === null && data.portfolios.length > 0) {
            selectedPortfolioId = data.portfolios[0].id;
        }
    });
</script>

<div class="flex items-end gap-4 mb-5 flex-wrap">
    <InputCash class="w-[200px]" label="Amount" bind:value={toDeposit} />
    <div class="flex flex-col gap-1">
        <label for="portfolio-select" class="text-sm font-medium">Portfolio</label>
        <select
            id="portfolio-select"
            class="block"
            value={selectedPortfolioId ?? ""}
            onchange={(e) => {
                const val = (e.target as HTMLSelectElement).value;
                selectedPortfolioId = val ? Number(val) : null;
            }}
        >
            <option value="">Select a portfolio</option>
            {#each data.portfolios as portfolio}
                <option value={portfolio.id}>{portfolio.name}</option>
            {/each}
        </select>
    </div>
</div>

{#if selectedPortfolio}
    <div class="w-full md:w-[260px]">
        <DepositAllocation
            class="w-full"
            title={selectedPortfolio.name}
            config={selectedPortfolio.config}
            depositCents={toDepositCents}
        />
    </div>
{:else}
    <p class="text-sage-500">Select a portfolio to see deposit allocations.</p>
{/if}
