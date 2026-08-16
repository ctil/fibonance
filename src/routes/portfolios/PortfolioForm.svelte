<script lang="ts">
    import { enhance } from "$app/forms";
    import { tick } from "svelte";
    import type { Portfolio } from "$lib/server/portfolios";
    import type { ClassValue } from "svelte/elements";
    import { Plus, X } from "lucide-svelte";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import FormButtons from "$lib/components/FormButtons.svelte";

    interface Props {
        portfolio?: Portfolio;
        oncancel: () => void;
        errorMessage?: string | null;
        class?: ClassValue;
    }

    let {
        portfolio,
        oncancel,
        errorMessage,
        class: className,
    }: Props = $props();

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

<Card class={["w-full max-w-2xl", className]}>
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

            <h3 class="type-display mb-5 text-lg text-ink">
                {portfolio ? "Edit portfolio" : "New portfolio"}
            </h3>

            <div class="mb-5">
                <label for="portfolio-name">Name</label>
                <input
                    id="portfolio-name"
                    name="name"
                    type="text"
                    required
                    class="px-3"
                    bind:value={name}
                />
            </div>

            <div class="mb-5">
                <div class="mb-2 flex items-baseline justify-between">
                    <h4 class="type-eyebrow">Holdings</h4>
                    <span
                        class={[
                            "text-sm font-medium tabular-nums",
                            percentageSum === 100
                                ? "text-accent"
                                : "text-attention",
                        ]}
                    >
                        Total: {percentageSum}%
                    </span>
                </div>

                {#each stocks as stock, i}
                    <div class="flex gap-2 mb-2 items-end">
                        <div class="w-24 shrink-0">
                            {#if i === 0}
                                <label for="stock-symbol-{i}">Symbol</label>
                            {/if}
                            <input
                                id="stock-symbol-{i}"
                                type="text"
                                required
                                placeholder="VTI"
                                class="px-3"
                                bind:value={stock.symbol}
                                oninput={() => {
                                    stock.symbol = stock.symbol.toUpperCase();
                                }}
                            />
                        </div>
                        <div class="w-20 shrink-0">
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
                                class="px-3 tabular-nums"
                                bind:value={stock.targetPercentage}
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            {#if i === 0}
                                <label for="stock-alt-{i}">Alternatives</label>
                            {/if}
                            <input
                                id="stock-alt-{i}"
                                type="text"
                                placeholder="FSKAX, SWTSX"
                                class="px-3"
                                bind:value={stock.alternatives}
                                oninput={() => {
                                    stock.alternatives =
                                        stock.alternatives.toUpperCase();
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            class="cursor-pointer rounded-control p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-faint"
                            onclick={() => removeStock(i)}
                            disabled={stocks.length <= 1}
                            aria-label="Remove holding"
                        >
                            <X size={16} />
                        </button>
                    </div>
                {/each}

                <Button
                    variant="ghost"
                    size="sm"
                    class="mt-1 -ml-3"
                    onclick={addStock}
                >
                    <Plus size={14} />
                    Add holding
                </Button>
            </div>

            <input type="hidden" name="stocks" value={JSON.stringify(stocks)} />

            {#if errorMessage}
                <p class="mb-3 text-sm text-danger">{errorMessage}</p>
            {/if}

            <FormButtons
                submitLabel={portfolio ? "Save" : "Create"}
                {oncancel}
            />
        </form>
    {/snippet}
</Card>
