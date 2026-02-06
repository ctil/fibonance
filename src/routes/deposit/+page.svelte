<script lang="ts">
    import { enhance } from "$app/forms";
    import DepositAllocation from "$lib/components/DepositAllocation.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import PortfolioForm from "$lib/components/PortfolioForm.svelte";

    let { data, form } = $props();

    let toDeposit = $state(null);
    let toDepositCents = $derived(toDeposit ? toDeposit * 100 : 0);

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

<div class="flex items-center gap-4 mb-5">
    <InputCash class="w-[200px]" label="Amount" bind:value={toDeposit} />
    <button
        class="bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition mt-6"
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

<div class="flex flex-col md:flex-row gap-3 flex-wrap">
    {#each data.portfolios as portfolio}
        {#if editingPortfolioId === portfolio.id}
            <PortfolioForm
                {portfolio}
                oncancel={cancelForm}
                errorMessage={form?.message}
            />
        {:else}
            <div class="w-full md:w-[260px]">
                <DepositAllocation
                    class="w-full"
                    title={portfolio.name}
                    config={portfolio.config}
                    depositCents={toDepositCents}
                />
                <div class="flex gap-2 mt-2">
                    <button
                        class="text-sm text-sage-600 hover:text-sage-800 transition"
                        onclick={() => {
                            creatingNew = false;
                            editingPortfolioId = portfolio.id;
                        }}
                    >
                        Edit
                    </button>
                    <form
                        method="post"
                        action="?/delete"
                        use:enhance={({ cancel }) => {
                            if (
                                !confirm(
                                    `Delete portfolio "${portfolio.name}"?`,
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
                            value={portfolio.id}
                        />
                        <button
                            type="submit"
                            class="text-sm text-red-600 hover:text-red-800 transition"
                        >
                            Delete
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    {/each}
</div>
