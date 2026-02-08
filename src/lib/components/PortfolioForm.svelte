<script lang="ts">
    import { enhance } from "$app/forms";
    import { tick } from "svelte";
    import type { Portfolio } from "$lib/server/portfolios";
    import { X } from "lucide-svelte";
    import Card from "./Card.svelte";

    interface Props {
        portfolio?: Portfolio;
        oncancel: () => void;
        errorMessage?: string | null;
    }

    let { portfolio, oncancel, errorMessage }: Props = $props();

    function getInitialName() {
        return portfolio?.name ?? "";
    }
    function getInitialStocks() {
        return portfolio
            ? portfolio.config.stocks.map((s) => ({
                  symbol: s.symbol,
                  targetPercentage: s.targetPercentage,
                  alternatives: s.alternatives?.join(", ") ?? "",
              }))
            : [{ symbol: "", targetPercentage: 0, alternatives: "" }];
    }
    let name = $state(getInitialName());
    let stocks = $state(getInitialStocks());

    let percentageSum = $derived(
        stocks.reduce((sum, s) => sum + (s.targetPercentage || 0), 0),
    );

    async function addStock() {
        stocks.push({ symbol: "", targetPercentage: 0, alternatives: "" });
        await tick();
        document.getElementById(`stock-symbol-${stocks.length - 1}`)?.focus();
    }

    function removeStock(index: number) {
        stocks.splice(index, 1);
    }

    let action = $derived(portfolio ? "?/update" : "?/create");
</script>

<Card class="w-full max-w-sm">
    {#snippet body()}
        <form
            method="post"
            {action}
            use:enhance={() => {
                return async ({ update, result }) => {
                    if (result.type === "success") {
                        oncancel();
                    }
                    await update();
                };
            }}
        >
            {#if portfolio}
                <input type="hidden" name="portfolioId" value={portfolio.id} />
            {/if}

            <h3 class="text-lg font-semibold mb-4">
                {portfolio ? "Edit Portfolio" : "New Portfolio"}
            </h3>

            <div class="mb-3">
                <label for="portfolio-name">Name</label>
                <input
                    id="portfolio-name"
                    name="name"
                    type="text"
                    required
                    bind:value={name}
                />
            </div>

            <div class="mb-3">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="text-md font-medium">Stocks</h4>
                    <span
                        class={[
                            "text-sm font-medium",
                            percentageSum === 100
                                ? "text-meadow-700"
                                : "text-red-600",
                        ]}
                    >
                        Total: {percentageSum}%
                    </span>
                </div>

                {#each stocks as stock, i}
                    <div class="flex gap-2 mb-2 items-end">
                        <div class="w-32">
                            {#if i === 0}
                                <label for="stock-symbol-{i}">Symbol</label>
                            {/if}
                            <input
                                id="stock-symbol-{i}"
                                type="text"
                                required
                                placeholder="VTI"
                                bind:value={stock.symbol}
                                oninput={() => {
                                    stock.symbol = stock.symbol.toUpperCase();
                                }}
                            />
                        </div>
                        <div class="w-24">
                            {#if i === 0}
                                <label for="stock-pct-{i}">%</label>
                            {/if}
                            <input
                                id="stock-pct-{i}"
                                type="number"
                                min="1"
                                max="100"
                                step="1"
                                required
                                bind:value={stock.targetPercentage}
                            />
                        </div>
                        <div class="flex-1">
                            {#if i === 0}
                                <label for="stock-alt-{i}">Alternatives</label>
                            {/if}
                            <input
                                id="stock-alt-{i}"
                                type="text"
                                placeholder="FSKAX, SWTSX"
                                bind:value={stock.alternatives}
                                oninput={() => {
                                    stock.alternatives =
                                        stock.alternatives.toUpperCase();
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition cursor-pointer"
                            onclick={() => removeStock(i)}
                            disabled={stocks.length <= 1}
                        >
                            <X size={16} />
                        </button>
                    </div>
                {/each}

                <button
                    type="button"
                    class="text-sm text-sage-600 hover:text-sage-800 transition"
                    onclick={addStock}
                >
                    + Add Stock
                </button>
            </div>

            <input type="hidden" name="stocks" value={JSON.stringify(stocks)} />

            {#if errorMessage}
                <p class="text-red-600 text-sm mb-3">{errorMessage}</p>
            {/if}

            <div class="flex gap-3">
                <button
                    type="submit"
                    class="flex-1 bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition"
                >
                    {portfolio ? "Save" : "Create"}
                </button>
                <button
                    type="button"
                    class="flex-1 bg-cream-200 text-cream-700 px-4 py-2 rounded-md hover:bg-cream-300 transition"
                    onclick={oncancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    {/snippet}
</Card>
