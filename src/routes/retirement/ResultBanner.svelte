<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";

    type Variant = "success" | "error" | "empty";

    interface Props {
        variant: Variant;
        children: Snippet;
        class?: ClassValue;
    }
    let { variant, children, class: className }: Props = $props();

    const styles: Record<Variant, string> = {
        success: "border-accent-line bg-accent-soft",
        error: "border-danger-line bg-danger-soft",
        empty: "border-line bg-surface",
    };
</script>

<div
    class={[
        "flex min-h-48 items-center justify-center rounded-surface border p-8",
        styles[variant],
        className,
    ]}
>
    {@render children()}
</div>
