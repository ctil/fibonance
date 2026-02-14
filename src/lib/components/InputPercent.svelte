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

<div class={className}>
    <label for="{uid}-percent">
        {label}
    </label>
    <div class="relative">
        <input
            id="{uid}-percent"
            type="number"
            step="1"
            min="0"
            class="pl-3 pr-8"
            bind:value
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-cream-500"
            >%</span
        >
    </div>
</div>
