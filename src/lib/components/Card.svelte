<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        header?: string;
        headerActions?: Snippet;
        body: Snippet;
        class?: ClassValue;
    }
    let { header, headerActions, body, class: className }: Props = $props();
</script>

<div
    class={["bg-white border border-cream-300 rounded-lg shadow-sm", className]}
>
    {#if header}
        <div class="px-6 py-4 border-b border-cream-300 flex items-center justify-center relative">
            <h3 class="mb-0 text-lg font-semibold">{header}</h3>
            {#if headerActions}
                <div class="absolute right-3 flex items-center gap-1">
                    {@render headerActions()}
                </div>
            {/if}
        </div>
    {/if}
    <div class="p-6">{@render body()}</div>
</div>
