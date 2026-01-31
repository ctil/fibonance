<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import cavalier from "$lib/assets/cavalier.svg";
    import { page } from "$app/state";

    let { children } = $props();
    let menuOpen = $state(false);

    function getLinkClass(path: string) {
        const base =
            "no-underline py-2 px-3 rounded text-cream-50 transition-all duration-200 hover:bg-white/10";
        return page.url.pathname === path
            ? `${base} font-bold bg-white/20`
            : base;
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav class="bg-sage-600 px-6 py-3 flex items-center justify-between relative">
    <div class="flex items-center gap-2">
        <img src={cavalier} alt="Cavalier" class="w-8 h-8" />
        <span class="text-cream-50 text-xl font-semibold">Fibonance</span>
    </div>

    <!-- Desktop nav links -->
    <div class="hidden md:flex gap-2">
        <a href="/" class={getLinkClass("/")}>Home</a>
        <a href="/deposit" class={getLinkClass("/deposit")}>Deposit</a>
        <a href="/interest" class={getLinkClass("/interest")}>Interest</a>
    </div>

    <!-- Hamburger button (mobile) -->
    <button
        class="md:hidden text-cream-50 p-2"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label="Toggle menu"
    >
        {#if menuOpen}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        {/if}
    </button>

    <!-- Mobile dropdown menu -->
    {#if menuOpen}
        <div class="absolute top-full left-0 right-0 bg-sage-600 md:hidden flex flex-col py-2 px-6 gap-1 shadow-lg z-50">
            <a href="/" class={getLinkClass("/")} onclick={() => (menuOpen = false)}>Home</a>
            <a href="/deposit" class={getLinkClass("/deposit")} onclick={() => (menuOpen = false)}>Deposit</a>
            <a href="/interest" class={getLinkClass("/interest")} onclick={() => (menuOpen = false)}>Interest</a>
        </div>
    {/if}
</nav>

<div class="p-5">
    {@render children()}
</div>
