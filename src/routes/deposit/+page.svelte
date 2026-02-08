<script lang="ts">
    import { enhance } from "$app/forms";
    import DepositAllocation from "$lib/components/DepositAllocation.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import PortfolioForm from "$lib/components/PortfolioForm.svelte";
    import { Pencil, Trash2 } from "lucide-svelte";

    let { data, form } = $props();

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

    let editingPortfolioId: number | null = $state(null);
    let creatingNew = $state(false);

    function startCreate() {
        editingPortfolioId = null;
        creatingNew = true;
    }

    function cancelForm() {
        editingPortfolioId = null;
        creatingNew = false;
    }
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
    <button
        class="bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition"
        onclick={startCreate}
    >
        New Portfolio
    </button>
</div>

{#if creatingNew}
    <div class="mb-5">
        <PortfolioForm oncancel={cancelForm} errorMessage={form?.message} />
    </div>
{/if}

{#if selectedPortfolio}
    {#if editingPortfolioId === selectedPortfolio.id}
        <PortfolioForm
            portfolio={selectedPortfolio}
            oncancel={cancelForm}
            errorMessage={form?.message}
        />
    {:else}
        <div class="w-full md:w-[260px]">
            <DepositAllocation
                class="w-full"
                title={selectedPortfolio.name}
                config={selectedPortfolio.config}
                depositCents={toDepositCents}
            >
                {#snippet headerActions()}
                    <button
                        class="p-1 text-sage-600 hover:text-sage-800 hover:bg-cream-200 rounded transition cursor-pointer"
                        onclick={() => {
                            creatingNew = false;
                            editingPortfolioId = selectedPortfolio!.id;
                        }}
                    >
                        <Pencil size={16} />
                    </button>
                    <form
                        method="post"
                        action="?/delete"
                        use:enhance={({ cancel }) => {
                            if (
                                !confirm(
                                    `Delete portfolio "${selectedPortfolio!.name}"?`,
                                )
                            ) {
                                cancel();
                                return;
                            }
                        }}
                    >
                        <input
                            type="hidden"
                            name="portfolioId"
                            value={selectedPortfolio.id}
                        />
                        <button
                            type="submit"
                            class="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition cursor-pointer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </form>
                {/snippet}
            </DepositAllocation>
        </div>
    {/if}
{:else if !creatingNew}
    <p class="text-sage-500">Select a portfolio to see deposit allocations.</p>
{/if}
