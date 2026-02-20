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
        success: "border-green-200 bg-green-50",
        error: "border-red-200 bg-red-50",
        empty: "border-cream-300 bg-cream-50",
    };
</script>

<div
    class={[
        "rounded-lg border p-8 flex items-center justify-center min-h-48",
        styles[variant],
        className,
    ]}
>
    {@render children()}
</div>
