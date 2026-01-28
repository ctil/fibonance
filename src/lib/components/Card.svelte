<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        header?: string;
        body: Snippet;
        class?: ClassValue;
    }
    let { header, body, class: className }: Props = $props();
</script>

<div
    class={["bg-white border border-cream-300 rounded-lg shadow-sm", className]}
>
    {#if header}
        <div class="px-6 py-4 border-b border-cream-300 text-center">
            <h3 class="mb-0 text-lg font-semibold">{header}</h3>
        </div>
    {/if}
    <div class="p-6">{@render body()}</div>
</div>
