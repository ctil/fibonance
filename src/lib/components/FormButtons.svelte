<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import Button from "./Button.svelte";

    interface Props {
        submitLabel?: string;
        oncancel: () => void;
        class?: ClassValue;
    }

    let { submitLabel = "Save", oncancel, class: className }: Props = $props();
</script>

<div class={["flex gap-3", className]}>
    <Button type="submit" block>{submitLabel}</Button>
    <Button variant="secondary" block onclick={oncancel}>Cancel</Button>
</div>
