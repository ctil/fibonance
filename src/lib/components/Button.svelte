<script lang="ts">
    import type { Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";
    import { buttonClass, type ButtonSize, type ButtonVariant } from "./button";

    interface Props {
        children: Snippet;
        variant?: ButtonVariant;
        size?: ButtonSize;
        block?: boolean;
        selected?: boolean;
        /** Renders an `<a>` instead of a `<button>`. */
        href?: string;
        type?: "button" | "submit" | "reset";
        disabled?: boolean;
        title?: string;
        onclick?: (event: MouseEvent) => void;
        class?: ClassValue;
    }

    let {
        children,
        variant = "primary",
        size = "md",
        block,
        selected,
        href,
        type = "button",
        disabled,
        title,
        onclick,
        class: className,
    }: Props = $props();

    let classes = $derived(
        buttonClass({ variant, size, block, selected }, className),
    );
</script>

{#if href}
    <a {href} {title} class={classes} {onclick}>{@render children()}</a>
{:else}
    <button {type} {disabled} {title} class={classes} {onclick}>
        {@render children()}
    </button>
{/if}
