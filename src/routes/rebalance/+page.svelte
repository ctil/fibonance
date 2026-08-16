<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import Field from "$lib/components/Field.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import { buttonClass } from "$lib/components/button";
    import { rebalance, formatAmount } from "$lib/rebalance";
    import { Upload } from "lucide-svelte";

    let { data } = $props();

    let selectedPortfolioId: number | null = $state(null);
    let csvContent: string | null = $state(null);
    let csvFileName: string | null = $state(null);
    let depositValue: number | null = $state(null);
    let depositCents = $derived(depositValue ? depositValue * 100 : 0);

    let selectedPortfolio = $derived(
        data.portfolios.find((p) => p.id === selectedPortfolioId) ?? null,
    );

    let result = $derived(
        selectedPortfolio && csvContent
            ? rebalance(selectedPortfolio.config, csvContent, depositCents)
            : null,
    );

    let symbolEntries = $derived(result ? Object.entries(result.symbols) : []);

    function handleFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) {
            csvContent = null;
            csvFileName = null;
            return;
        }
        csvFileName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            csvContent = reader.result as string;
        };
        reader.readAsText(file);
    }
</script>

<svelte:head>
    <title>Rebalance - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Investments"
    title="Rebalance"
    description="Compare a holdings export against a portfolio's targets to see what to buy and sell."
/>

<div class="flex flex-wrap items-end gap-4">
    <Field label="Portfolio" class="w-56">
        {#snippet control(id)}
            <select
                {id}
                class="px-3"
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

    <div>
        <span class="mb-1.5 block text-sm font-medium text-ink-faint">
            Holdings CSV
        </span>
        <!-- A <label> rather than a <button> so it can open the file picker,
             wearing the shared button styling rather than approximating it. -->
        <!-- py-2.5 rather than the button default so this lines up on the same
             baseline as the inputs beside it, which are set in text-base. -->
        <label
            for="csv-upload"
            class={buttonClass(
                { variant: "secondary" },
                "mb-0 max-w-56 py-2.5",
            )}
        >
            <Upload size={15} />
            <span class="truncate">{csvFileName ?? "Choose file"}</span>
        </label>
        <input
            id="csv-upload"
            class="sr-only"
            type="file"
            accept=".csv"
            onchange={handleFileChange}
        />
    </div>

    <InputCash class="w-52" label="Deposit amount" bind:value={depositValue} />
</div>

<div class="mt-8">
    {#if result}
        <Card header="What to trade" flush>
            {#snippet body()}
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-line text-left">
                                <th class="type-eyebrow py-3 pr-4 pl-5"
                                    >Symbol</th
                                >
                                <th class="type-eyebrow py-3 pr-4 text-right"
                                    >Current value</th
                                >
                                <th class="type-eyebrow py-3 pr-4 text-right"
                                    >Target</th
                                >
                                <th class="type-eyebrow py-3 pr-4 text-right"
                                    >Current</th
                                >
                                <th class="type-eyebrow py-3 pr-4 text-right"
                                    >Drift</th
                                >
                                <th class="type-eyebrow py-3 pr-5">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-line-soft">
                            {#each symbolEntries as [symbol, data]}
                                <tr>
                                    <td class="py-3 pr-4 pl-5 font-medium"
                                        >{symbol}</td
                                    >
                                    <td class="py-3 pr-4 text-right"
                                        >{formatAmount(data.amount, true)}</td
                                    >
                                    <td
                                        class="py-3 pr-4 text-right text-ink-faint"
                                        >{data.targetPercentage.toFixed(1)}%</td
                                    >
                                    <td
                                        class="py-3 pr-4 text-right text-ink-faint"
                                        >{data.currentPercentage.toFixed(
                                            1,
                                        )}%</td
                                    >
                                    <!-- Drift is a distance, not a verdict, so
                                         it stays neutral and lets the sign do
                                         the work. Colouring it by sign fought
                                         the Buy/Sell pill beside it: being
                                         overweight is a positive drift but a
                                         sell. -->
                                    <td
                                        class="py-3 pr-4 text-right font-medium text-ink"
                                    >
                                        {data.drift > 0
                                            ? "+"
                                            : ""}{data.drift.toFixed(1)}%
                                    </td>
                                    <td class="py-3 pr-5">
                                        {#if data.amountNeeded !== 0}
                                            <span
                                                class="inline-flex items-center gap-2"
                                            >
                                                <span
                                                    class={[
                                                        "rounded-control px-1.5 py-0.5 text-xs font-semibold",
                                                        data.amountNeeded > 0
                                                            ? "bg-accent-soft text-accent"
                                                            : "bg-attention-soft text-attention",
                                                    ]}
                                                >
                                                    {data.amountNeeded > 0
                                                        ? "Buy"
                                                        : "Sell"}
                                                </span>
                                                <CopyCash
                                                    cents={Math.abs(
                                                        data.amountNeeded,
                                                    )}
                                                />
                                            </span>
                                        {:else}
                                            <span class="text-ink-faint">—</span
                                            >
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                        <tfoot>
                            <tr class="border-t border-line">
                                <td
                                    class="py-3 pr-4 pl-5 text-ink-faint"
                                    colspan="1">Total</td
                                >
                                <td class="py-3 pr-4 text-right font-medium">
                                    {formatAmount(result.total, true)}
                                </td>
                                <td colspan="4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            {/snippet}
        </Card>
    {:else}
        <div
            class="rounded-surface border border-dashed border-line p-10 text-center"
        >
            <p class="text-sm text-ink-muted">
                {#if !selectedPortfolio}
                    Choose a portfolio, then upload your holdings CSV.
                {:else}
                    Upload a holdings CSV to compare against {selectedPortfolio.name}.
                {/if}
            </p>
            <p class="mt-2 text-xs text-ink-faint">
                The file needs <code class="text-ink-muted">Symbol</code> and
                <code class="text-ink-muted">Current Value</code> columns.
            </p>
        </div>
    {/if}
</div>
