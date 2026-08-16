<script lang="ts">
    import PageHeader from "$lib/components/PageHeader.svelte";
    import InterestCalc from "./InterestCalc.svelte";
</script>

<svelte:head>
    <title>Interest - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Calculators"
    title="Compound interest"
    description="What a starting balance and a regular contribution grow to."
/>

<InterestCalc />
