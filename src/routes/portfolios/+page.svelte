<script lang="ts">
    import PortfolioForm from "./PortfolioForm.svelte";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import { Plus, Pencil } from "lucide-svelte";

    let { data, form } = $props();

    let editingPortfolioId: number | null = $state(null);
    let creatingNew = $state(false);

    function startCreate() {
        editingPortfolioId = null;
        creatingNew = true;
    }

    function startEdit(id: number) {
        creatingNew = false;
        editingPortfolioId = id;
    }

    function cancelForm() {
        editingPortfolioId = null;
        creatingNew = false;
    }
</script>

<svelte:head>
    <title>Portfolios - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Investments"
    title="Portfolios"
    description="Target allocations that deposits and rebalances are measured against."
>
    {#snippet actions()}
        <Button onclick={startCreate}>
            <Plus size={16} />
            New portfolio
        </Button>
    {/snippet}
</PageHeader>

{#if creatingNew}
    <div class="mb-6">
        <PortfolioForm oncancel={cancelForm} errorMessage={form?.message} />
    </div>
{/if}

{#if data.portfolios.length === 0 && !creatingNew}
    <div
        class="rounded-surface border border-dashed border-line p-10 text-center"
    >
        <p class="text-sm text-ink-muted">
            No portfolios yet. Create one to set your target allocation.
        </p>
        <Button class="mt-4" onclick={startCreate}>
            <Plus size={16} />
            New portfolio
        </Button>
    </div>
{:else}
    <div class="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.portfolios as portfolio}
            {#if editingPortfolioId === portfolio.id}
                <PortfolioForm
                    {portfolio}
                    oncancel={cancelForm}
                    errorMessage={form?.message}
                    class="sm:col-span-2 lg:col-span-3"
                />
            {:else}
                <Card header={portfolio.name}>
                    {#snippet headerActions()}
                        <button
                            class="cursor-pointer rounded-control p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                            onclick={() => startEdit(portfolio.id)}
                            aria-label="Edit {portfolio.name}"
                        >
                            <Pencil size={16} />
                        </button>
                        <DeleteButton
                            action="?/delete"
                            name="portfolioId"
                            id={portfolio.id}
                            confirmMessage={`Delete portfolio "${portfolio.name}"?`}
                        />
                    {/snippet}
                    {#snippet body()}
                        <ul class="space-y-3.5">
                            {#each portfolio.config.stocks as stock}
                                <li>
                                    <div
                                        class="flex items-baseline justify-between gap-3"
                                    >
                                        <span class="font-medium text-ink">
                                            {stock.symbol}
                                        </span>
                                        <span
                                            class="type-display text-sm text-ink tabular-nums"
                                        >
                                            {stock.targetPercentage}%
                                        </span>
                                    </div>
                                    <!-- The bar makes the shape of the
                                         allocation readable at a glance. -->
                                    <div
                                        class="mt-1.5 h-1.5 rounded-full bg-line-soft"
                                    >
                                        <div
                                            class="h-full rounded-full bg-accent"
                                            style="width: {Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    stock.targetPercentage,
                                                ),
                                            )}%"
                                        ></div>
                                    </div>
                                    {#if stock.alternatives?.length}
                                        <p
                                            class="mt-1.5 text-xs text-ink-faint"
                                        >
                                            Alt: {stock.alternatives.join(", ")}
                                        </p>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    {/snippet}
                </Card>
            {/if}
        {/each}
    </div>
{/if}
