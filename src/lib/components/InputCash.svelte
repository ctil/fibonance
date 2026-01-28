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
    <label for="{uid}-amount">{label}</label>
    <input id="{uid}-amount" type="number" bind:value />
</div>
