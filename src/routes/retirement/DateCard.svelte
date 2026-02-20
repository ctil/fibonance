<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import { formatDate } from "$lib/retirement";

    interface Props {
        label: string;
        date: Date;
        years: number;
        age?: number | null;
        class?: ClassValue;
    }
    let { label, date, years, age, class: className }: Props = $props();

    const subtext = $derived(
        age != null
            ? `Age ${age.toFixed(1)} · in ${years.toFixed(1)} years`
            : `in ${years.toFixed(1)} years`,
    );
</script>

<div
    class={[
        "bg-white border border-cream-300 rounded-lg shadow-sm p-5",
        className,
    ]}
>
    <p class="text-xs font-medium text-cream-600 uppercase tracking-wide mb-1">
        {label}
    </p>
    <p class="text-3xl font-bold">{formatDate(date)}</p>
    <p class="text-md text-cream-600 mt-1">{subtext}</p>
</div>
