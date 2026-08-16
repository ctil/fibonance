<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        /** What is being measured, e.g. "Progress to goal". */
        label: string;
        /** The headline reading, already formatted, e.g. "44.8%". */
        value?: string;
        /** Fill, 0–100. Clamped. */
        percent: number;
        /**
         * `accent` for progress toward something good (savings, documents
         * collected); `attention` for working a balance down (mortgage).
         */
        tone?: "accent" | "attention";
        /** Captions under each end of the track. */
        startCaption?: string;
        endCaption?: string;
        class?: ClassValue;
    }

    let {
        label,
        value,
        percent,
        tone = "accent",
        startCaption,
        endCaption,
        class: className,
    }: Props = $props();

    const clamp = (n: number) => Math.min(100, Math.max(0, n));

    let fill = $derived(clamp(percent));
    let fillColor = $derived(
        tone === "attention" ? "bg-attention" : "bg-accent",
    );
</script>

<div class={className}>
    <div class="flex items-baseline justify-between gap-4">
        <span class="type-eyebrow">{label}</span>
        {#if value}
            <span class="type-display text-sm text-ink tabular-nums">
                {value}
            </span>
        {/if}
    </div>

    <div
        class="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(fill)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={value}
    >
        <div
            class={[
                "h-full rounded-full transition-[width] duration-300",
                fillColor,
            ]}
            style="width: {fill}%"
        ></div>
    </div>

    {#if startCaption || endCaption}
        <div
            class="mt-1.5 flex items-baseline justify-between gap-4 text-xs text-ink-faint tabular-nums"
        >
            <span>{startCaption ?? ""}</span>
            <span>{endCaption ?? ""}</span>
        </div>
    {/if}
</div>
