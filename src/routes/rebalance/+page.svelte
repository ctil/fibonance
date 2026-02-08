<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import { rebalance, formatAmount } from "$lib/rebalance";

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

<div class="flex flex-wrap items-end gap-4 mb-5">
    <div>
        <label for="portfolio-select">Portfolio</label>
        <select
            id="portfolio-select"
            class="block"
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

    <div>
        <label for="csv-upload">CSV File</label>
        <label
            for="csv-upload"
            class="block cursor-pointer bg-sage-600 !text-white px-4 py-[0.5625rem] !mb-0 border border-sage-600 rounded-lg hover:bg-sage-700 hover:border-sage-700 transition text-center leading-normal"
        >
            {csvFileName ?? "Upload CSV"}
        </label>
        <input
            id="csv-upload"
            class="hidden"
            type="file"
            accept=".csv"
            onchange={handleFileChange}
        />
    </div>

    <InputCash
        class="w-[200px]"
        label="Deposit Amount"
        bind:value={depositValue}
    />
</div>

{#if result}
    <Card header="Rebalance Results">
        {#snippet body()}
            <p class="mb-4 text-sm text-cream-600">
                Total portfolio value: <strong
                    >{formatAmount(result.total, true)}</strong
                >
            </p>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-cream-300 text-left">
                            <th class="py-2 pr-4">Symbol</th>
                            <th class="py-2 pr-4">Current Value</th>
                            <th class="py-2 pr-4">Target %</th>
                            <th class="py-2 pr-4">Current %</th>
                            <th class="py-2 pr-4">Drift %</th>
                            <th class="py-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each symbolEntries as [symbol, data]}
                            <tr class="border-b border-cream-200">
                                <td class="py-2 pr-4 font-medium">{symbol}</td>
                                <td class="py-2 pr-4"
                                    >{formatAmount(data.amount, true)}</td
                                >
                                <td class="py-2 pr-4"
                                    >{data.targetPercentage.toFixed(1)}%</td
                                >
                                <td class="py-2 pr-4"
                                    >{data.currentPercentage.toFixed(1)}%</td
                                >
                                <td
                                    class="py-2 pr-4"
                                    class:text-red-600={data.drift < 0}
                                    class:text-green-600={data.drift > 0}
                                >
                                    {data.drift > 0
                                        ? "+"
                                        : ""}{data.drift.toFixed(1)}%
                                </td>
                                <td class="py-2">
                                    {#if data.amountNeeded !== 0}
                                        <span
                                            class="{data.amountNeeded > 0
                                                ? 'text-green-600'
                                                : 'text-red-600'} mr-2"
                                        >
                                            {data.amountNeeded > 0
                                                ? "Buy"
                                                : "Sell"}
                                        </span>
                                        <CopyCash
                                            cents={Math.abs(data.amountNeeded)}
                                        />
                                    {:else}
                                        <span class="text-cream-500">—</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/snippet}
    </Card>
{/if}
