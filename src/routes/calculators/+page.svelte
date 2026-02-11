<script lang="ts">
    import InterestCalc from "$lib/components/InterestCalc.svelte";
    import RetirementCalc from "$lib/components/RetirementCalc.svelte";

    let activeTab: "interest" | "retirement" = $state("retirement");
</script>

<div class="flex flex-col items-center mt-4 w-full">
    <div class="flex w-full max-w-sm gap-2">
        <button
            class="flex-1 py-2 px-4 rounded font-medium transition-all duration-200 {activeTab ===
            'retirement'
                ? 'bg-sage-600 text-cream-50'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}"
            onclick={() => (activeTab = "retirement")}
        >
            Retirement
        </button>
        <button
            class="flex-1 py-2 px-4 rounded font-medium transition-all duration-200 {activeTab ===
            'interest'
                ? 'bg-sage-600 text-cream-50'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}"
            onclick={() => (activeTab = "interest")}
        >
            Interest
        </button>
    </div>

    {#if activeTab === "interest"}
        <InterestCalc class="w-full max-w-sm mt-4" />
    {:else}
        <RetirementCalc class="w-full max-w-sm mt-4" />
    {/if}
</div>
