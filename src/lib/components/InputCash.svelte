<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        value?: number | null;
        label: string;
        class?: ClassValue;
    }

    const uid = $props.id();

    let { value = $bindable(), label, class: className }: Props = $props();
</script>

<div class={["mb-4", className]}>
    <label
        for="{uid}-amount"
        class="block text-sm font-medium text-cream-700 mb-1.5"
    >
        {label}
    </label>
    <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500"
            >$</span
        >
        <input
            id="{uid}-amount"
            type="number"
            class="w-full pl-7 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-lg
                   text-cream-900 placeholder-cream-400
                   focus:outline-none focus:ring-2 focus:ring-meadow-400 focus:border-meadow-400
                   transition-colors duration-150"
            bind:value
        />
    </div>
</div>
