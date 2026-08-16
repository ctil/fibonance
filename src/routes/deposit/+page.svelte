<script lang="ts">
    import DepositAllocation from "./DepositAllocation.svelte";
    import Field from "$lib/components/Field.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";

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

<svelte:head>
    <title>Deposit - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Investments"
    title="Deposit"
    description="Split a new deposit across a portfolio's targets."
/>

<div class="flex flex-wrap items-end gap-4">
    <InputCash class="w-52" label="Amount" bind:value={toDeposit} />
    <Field label="Portfolio" class="w-56">
        {#snippet control(id)}
            <select
                {id}
                class="px-3"
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
        {/snippet}
    </Field>
</div>

<div class="mt-8 max-w-sm">
    {#if selectedPortfolio}
        <DepositAllocation
            title={selectedPortfolio.name}
            config={selectedPortfolio.config}
            depositCents={toDepositCents}
        />
    {:else}
        <div
            class="rounded-surface border border-dashed border-line p-8 text-center text-sm text-ink-faint"
        >
            Choose a portfolio to see how the deposit splits.
        </div>
    {/if}
</div>
