<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    type Tone = "neutral" | "positive" | "attention" | "muted";

    interface Props {
        label: string;
        value: string;
        subtext?: string;
        /**
         * `positive` for gains and time saved, `attention` for money going out,
         * `muted` for the baseline you are comparing against.
         */
        tone?: Tone;
        /** Shown in place of the value when there is nothing to report yet. */
        empty?: boolean;
        emptyHint?: string;
        class?: ClassValue;
    }

    let {
        label,
        value,
        subtext,
        tone = "neutral",
        empty,
        emptyHint,
        class: className,
    }: Props = $props();

    const tones: Record<Tone, string> = {
        neutral: "text-ink",
        positive: "text-accent",
        attention: "text-attention",
        muted: "text-ink-faint",
    };
</script>

<div
    class={[
        "bg-surface border border-line rounded-surface shadow-surface p-5",
        className,
    ]}
>
    <p class="type-eyebrow">{label}</p>
    {#if empty}
        <!-- No type-display here: the expanded width stretches an em dash into
             something that reads as a broken rule rather than "no value". -->
        <p class="mt-1.5 text-3xl text-ink-faint">&mdash;</p>
        {#if emptyHint}
            <p class="mt-1 text-sm text-ink-faint">{emptyHint}</p>
        {/if}
    {:else}
        <p class={["type-display mt-1.5 text-3xl tabular-nums", tones[tone]]}>
            {value}
        </p>
        {#if subtext}
            <p class="mt-1 text-sm text-ink-faint">{subtext}</p>
        {/if}
    {/if}
</div>
