<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        label: string;
        /** Receives the id to put on the control. */
        control: Snippet<[string]>;
        hint?: string;
        error?: string;
        class?: ClassValue;
    }

    let { label, control, hint, error, class: className }: Props = $props();

    const uid = $props.id();
</script>

<div class={className}>
    <label for={uid}>{label}</label>
    {@render control(uid)}
    {#if error}
        <p class="mt-1.5 text-sm text-danger">{error}</p>
    {:else if hint}
        <p class="mt-1.5 text-xs text-ink-faint">{hint}</p>
    {/if}
</div>
