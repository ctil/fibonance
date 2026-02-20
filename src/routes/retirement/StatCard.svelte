<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        label: string;
        value: string;
        subtext?: string;
        class?: ClassValue;
    }
    let { label, value, subtext, class: className }: Props = $props();
</script>

<div
    class={[
        "bg-white border border-cream-300 rounded-lg shadow-sm p-5",
        className,
    ]}
>
    <p class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1">
        {label}
    </p>
    <p class="text-3xl font-bold">{value}</p>
    {#if subtext}
        <p class="text-sm text-cream-600 mt-1">{subtext}</p>
    {/if}
</div>
