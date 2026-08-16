<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        value?: number | null;
        label: string;
        step?: string;
        class?: ClassValue;
    }

    const uid = $props.id();
    let {
        value = $bindable(),
        label,
        step = "1",
        class: className,
    }: Props = $props();
</script>

<div class={className}>
    <label for="{uid}-percent">
        {label}
    </label>
    <div class="relative">
        <input
            id="{uid}-percent"
            type="number"
            {step}
            min="0"
            class="pl-3 pr-8 tabular-nums"
            bind:value
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
            >%</span
        >
    </div>
</div>
