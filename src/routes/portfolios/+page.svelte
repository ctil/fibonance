<script lang="ts">
    import PortfolioForm from "./PortfolioForm.svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
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

<div class="flex items-center justify-between mb-5">
    <h1 class="text-2xl font-bold">Portfolios</h1>
    <button
        class="w-10 h-10 flex items-center justify-center rounded-full bg-sage-600 text-cream-50 hover:bg-sage-700 transition cursor-pointer"
        onclick={startCreate}
        aria-label="Add new portfolio"
    >
        <Plus size={20} />
    </button>
</div>

{#if creatingNew}
    <div class="mb-5">
        <PortfolioForm oncancel={cancelForm} errorMessage={form?.message} />
    </div>
{/if}

<div class="flex flex-wrap gap-4">
    {#each data.portfolios as portfolio}
        {#if editingPortfolioId === portfolio.id}
            <PortfolioForm
                {portfolio}
                oncancel={cancelForm}
                errorMessage={form?.message}
            />
        {:else}
            <Card class="w-full max-w-sm" header={portfolio.name}>
                {#snippet headerActions()}
                    <button
                        class="p-1 text-sage-600 hover:text-sage-800 hover:bg-cream-200 rounded transition cursor-pointer"
                        onclick={() => startEdit(portfolio.id)}
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
                    {#each portfolio.config.stocks as stock}
                        <div class="flex justify-between mb-1">
                            <span class="font-medium">{stock.symbol}</span>
                            <span class="text-sage-600"
                                >{stock.targetPercentage}%</span
                            >
                        </div>
                        {#if stock.alternatives?.length}
                            <p class="text-sm text-sage-500 mb-2 ml-2">
                                Alt: {stock.alternatives.join(", ")}
                            </p>
                        {/if}
                    {/each}
                {/snippet}
            </Card>
        {/if}
    {/each}
</div>

{#if data.portfolios.length === 0 && !creatingNew}
    <p class="text-sage-500">
        No portfolios yet. Click the + button to create one.
    </p>
{/if}
