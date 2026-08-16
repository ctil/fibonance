<script lang="ts">
    import { formatAmount } from "$lib/rebalance";
    import { Check, Copy } from "lucide-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        cents: number;
        class?: ClassValue;
    }

    let { cents, class: className }: Props = $props();

    let displayText = $derived(formatAmount(cents, true));
    let copyText = $derived(formatAmount(cents));

    let copied = $state(false);

    async function copy() {
        await navigator.clipboard.writeText(copyText);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

<span class={["inline-flex items-center gap-1.5", className]}>
    <span class="tabular-nums text-ink">{displayText}</span>
    <button
        type="button"
        onclick={copy}
        title={copied ? "Copied" : "Copy to clipboard"}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        class="cursor-pointer rounded-control p-1 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
    >
        {#if copied}
            <Check size={14} class="text-accent" />
        {:else}
            <Copy size={14} />
        {/if}
    </button>
</span>
