<script lang="ts">
    import type { Config } from "$lib/rebalance";
    import type { ClassValue } from "svelte/elements";
    import { deposit } from "$lib/rebalance";
    import CopyCash from "./CopyCash.svelte";
    import Card from "./Card.svelte";

    interface Props {
        title: string;
        config: Config;
        depositCents: number;
        class?: ClassValue;
    }
    let { title, config, depositCents, class: className }: Props = $props();
    let result = $derived(deposit(config, depositCents));
</script>

<Card class={className} header={title}>
    {#snippet body()}
        {#each result.allocations as allocation}
            <div class="flex justify-between mb-2">
                <span class="w-[60px]"
                    ><b class="mr-3">{allocation.symbol}</b></span
                >
                <CopyCash cents={allocation.amount} />
            </div>
        {/each}
    {/snippet}
</Card>
