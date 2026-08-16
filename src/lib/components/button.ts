import type { ClassValue } from "svelte/elements";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "icon";
export type ButtonSize = "sm" | "md";

export interface ButtonStyleOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Stretch to the width of the container. */
    block?: boolean;
    /** For `ghost` pills that act as a choice, e.g. the mortgage presets. */
    selected?: boolean;
}

const base =
    "inline-flex items-center justify-center gap-2 rounded-control font-medium " +
    "whitespace-nowrap cursor-pointer transition-colors duration-150 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
};

const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-cream-50 hover:bg-accent-hover",
    secondary:
        "bg-surface-inset text-ink-muted border border-line hover:bg-line-soft hover:text-ink",
    ghost: "text-ink-muted hover:bg-line-soft hover:text-ink",
    danger: "text-danger hover:bg-danger-soft",
    icon: "p-1.5 rounded-control text-ink-faint hover:bg-line-soft hover:text-ink",
};

/**
 * The canonical button styling, as a class string.
 *
 * Exported separately from `Button.svelte` so that elements which cannot be a
 * `<button>` — notably the file-upload `<label>` on /rebalance — can wear the
 * exact same styling instead of approximating it.
 */
export function buttonClass(
    options: ButtonStyleOptions = {},
    extra?: ClassValue,
): ClassValue {
    const { variant = "primary", size = "md", block, selected } = options;

    return [
        base,
        variant !== "icon" && sizes[size],
        selected
            ? "bg-accent text-cream-50 hover:bg-accent-hover"
            : variants[variant],
        block && "w-full",
        extra,
    ];
}
