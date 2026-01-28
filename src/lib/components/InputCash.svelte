<script lang="ts">
    import { untrack } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        value?: number | null;
        label: string;
        class?: ClassValue;
    }

    const uid = $props.id();

    let { value = $bindable(), label, class: className }: Props = $props();

    let displayValue = $state("");

    function formatWithCommas(num: number | null | undefined): string {
        if (num === null || num === undefined) return "";
        return num.toLocaleString("en-US");
    }

    function parseValue(str: string): number | null {
        const cleaned = str.replace(/,/g, "");
        if (cleaned === "") return null;
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }

    // Sync displayValue when value changes externally
    $effect(() => {
        const formatted = formatWithCommas(value);
        // Use untrack to read displayValue without subscribing to it
        if (untrack(() => parseValue(displayValue)) !== value) {
            displayValue = formatted;
        }
    });

    function handleInput(e: Event) {
        const input = e.target as HTMLInputElement;
        // Allow digits, commas, decimal point, and minus
        displayValue = input.value.replace(/[^0-9,.\-]/g, "");
    }

    function handleBlur() {
        value = parseValue(displayValue);
        displayValue = formatWithCommas(value);
    }
</script>

<div class={["mb-4", className]}>
    <label
        for="{uid}-amount"
        class="block text-sm font-medium text-cream-700 mb-1.5"
    >
        {label}
    </label>
    <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500"
            >$</span
        >
        <input
            id="{uid}-amount"
            type="text"
            inputmode="decimal"
            class="w-full pl-7 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-lg
                   text-cream-900 placeholder-cream-400
                   focus:outline-none focus:ring-2 focus:ring-meadow-400 focus:border-meadow-400
                   transition-colors duration-150"
            bind:value={displayValue}
            oninput={handleInput}
            onblur={handleBlur}
        />
    </div>
</div>
