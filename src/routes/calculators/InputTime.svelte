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
    <label for="{uid}-time">
        {label}
    </label>
    <input
        id="{uid}-time"
        type="number"
        step="1"
        min="0"
        class="px-3"
        bind:value
    />
</div>
