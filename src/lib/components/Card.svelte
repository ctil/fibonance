<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        header?: string;
        headerActions?: Snippet;
        body: Snippet;
        /** Removes the body padding, for cards whose body is a table or list. */
        flush?: boolean;
        class?: ClassValue;
    }

    let {
        header,
        headerActions,
        body,
        flush,
        class: className,
    }: Props = $props();
</script>

<div
    class={[
        "bg-surface border border-line rounded-surface shadow-surface",
        className,
    ]}
>
    {#if header}
        <div
            class="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5"
        >
            <h3 class="type-display mb-0 text-base text-ink">{header}</h3>
            {#if headerActions}
                <div class="flex shrink-0 items-center gap-1">
                    {@render headerActions()}
                </div>
            {/if}
        </div>
    {/if}
    <div class={flush ? "" : "p-5"}>{@render body()}</div>
</div>
