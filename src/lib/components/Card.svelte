<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        header?: string;
        body: Snippet;
    }
    let { header, body }: Props = $props();
</script>

<div class="bg-white border border-cream-300 rounded-lg shadow-sm">
    {#if header}
        <div class="px-6 py-4 border-b border-cream-300 text-center">
            <h3 class="mb-0">{header}</h3>
        </div>
    {/if}
    <div class="px-6 pb-6">{@render body()}</div>
</div>
