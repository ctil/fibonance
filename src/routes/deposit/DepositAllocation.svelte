<script lang="ts">
    import type { Config } from "$lib/rebalance";
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";
    import { deposit } from "$lib/rebalance";
    import CopyCash from "$lib/components/CopyCash.svelte";
    import Card from "$lib/components/Card.svelte";

    interface Props {
        title: string;
        config: Config;
        depositCents: number;
        headerActions?: Snippet;
        class?: ClassValue;
    }
    let {
        title,
        config,
        depositCents,
        headerActions,
        class: className,
    }: Props = $props();
    let result = $derived(deposit(config, depositCents));
</script>

<Card class={className} header={title} {headerActions}>
    {#snippet body()}
        <ul class="divide-y divide-line-soft">
            {#each result.allocations as allocation}
                <li class="flex items-center justify-between gap-4 py-2.5">
                    <span class="font-medium text-ink">{allocation.symbol}</span
                    >
                    <CopyCash cents={allocation.amount} />
                </li>
            {/each}
        </ul>
    {/snippet}
</Card>
