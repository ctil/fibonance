<script lang="ts">
    import RetirementCalc from "$lib/components/RetirementCalc.svelte";
    import type { PageData } from "./$types";
    const { data }: { data: PageData } = $props();
</script>

<RetirementCalc birthday={data.user?.birthday} class="w-full" />
