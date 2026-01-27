<script lang="ts">
import { formatAmount } from "$lib/rebalance";

interface Props {
    cents: number;
}

let { cents }: Props = $props();

let displayText = $derived(formatAmount(cents, true));
let copyText = $derived(formatAmount(cents));

let copied = $state(false);

async function copy() {
    await navigator.clipboard.writeText(copyText);
    copied = true;
    setTimeout(() => (copied = false), 2000);
}
</script>

<span class="copy-text">
    <code>{displayText}</code>
    <button onclick={copy} title="Copy to clipboard">
        {copied ? "Copied!" : "Copy"}
    </button>
</span>

<style>
    .copy-text {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    code {
        padding: 0.25rem 0.5rem;
        background: var(--bg-secondary, #f5f5f5);
        border-radius: 4px;
        font-family: monospace;
    }

    button {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        background: var(--bg-primary, white);
        cursor: pointer;
        font-size: 0.875rem;
    }

    button:hover {
        background: var(--bg-secondary, #f5f5f5);
    }
</style>
