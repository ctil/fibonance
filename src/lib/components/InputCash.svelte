<script lang="ts">
    import { untrack } from "svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        value?: number | null;
        label: string;
        class?: ClassValue;
        onsubmit?: () => void;
    }

    const uid = $props.id();

    let {
        value = $bindable(),
        label,
        class: className,
        onsubmit,
    }: Props = $props();

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
        value = parseValue(displayValue);
    }

    function handleBlur() {
        value = parseValue(displayValue);
        displayValue = formatWithCommas(value);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleBlur();
            onsubmit?.();
        }
    }
</script>

<div class={["mb-4", className]}>
    <label for="{uid}-amount">
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
            class="pl-7 pr-3"
            bind:value={displayValue}
            oninput={handleInput}
            onblur={handleBlur}
            onkeydown={handleKeydown}
        />
    </div>
</div>
