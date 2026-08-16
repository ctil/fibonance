<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        title: string;
        /** The section this page belongs to, matching the nav. */
        eyebrow?: string;
        /** One line of orientation, when the title alone is not enough. */
        description?: string;
        actions?: Snippet;
        class?: ClassValue;
    }

    let {
        title,
        eyebrow,
        description,
        actions,
        class: className,
    }: Props = $props();
</script>

<header class={["mb-8 border-b border-line pb-5", className]}>
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div class="min-w-0">
            {#if eyebrow}
                <p class="type-eyebrow mb-1.5">{eyebrow}</p>
            {/if}
            <h1 class="type-display text-3xl text-ink">{title}</h1>
        </div>
        {#if actions}
            <div class="flex shrink-0 items-center gap-2">
                {@render actions()}
            </div>
        {/if}
    </div>
    {#if description}
        <p class="mt-3 max-w-prose text-sm text-ink-muted">{description}</p>
    {/if}
</header>
