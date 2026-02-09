<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import type { LayoutData } from "./$types";

    let { children, data }: { children: any; data: LayoutData } = $props();
    let menuOpen = $state(false);

    function getLinkClass(path: string) {
        const base =
            "no-underline py-2 px-3 rounded text-cream-50 transition-all duration-200 hover:bg-white/10";
        return page.url.pathname === path
            ? `${base} font-bold bg-white/20`
            : base;
    }

    function getDisabledClass() {
        return "py-2 px-3 rounded text-cream-50/50 cursor-not-allowed";
    }
</script>

<svelte:head>
    <title>Fibonance</title>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav class="bg-sage-600 px-6 py-3 flex items-center justify-between relative">
    <div class="flex items-center gap-2">
        <img src={favicon} alt="Cavalier" class="w-8 h-8" />
        <span class="text-cream-50 text-xl font-semibold">Fibonance</span>
    </div>

    <!-- Desktop nav links -->
    <div class="hidden md:flex gap-2 items-center">
        <a href="/" class={getLinkClass("/")}>Home</a>
        {#if data.user}
            <a href="/portfolios" class={getLinkClass("/portfolios")}
                >Portfolios</a
            >
            <a href="/deposit" class={getLinkClass("/deposit")}>Deposit</a>
            <a href="/rebalance" class={getLinkClass("/rebalance")}>Rebalance</a
            >
        {:else}
            <span class={getDisabledClass()}>Portfolios</span>
            <span class={getDisabledClass()}>Deposit</span>
            <span class={getDisabledClass()}>Rebalance</span>
        {/if}
        <a href="/interest" class={getLinkClass("/interest")}>Interest</a>
        <a href="/retirement" class={getLinkClass("/retirement")}>Retirement</a>
        {#if data.user}
            <form method="post" action="/logout" use:enhance class="inline">
                <button class={getLinkClass("")}>Sign out</button>
            </form>
        {:else}
            <a href="/login" class={getLinkClass("/login")}>Sign in</a>
        {/if}
    </div>

    <!-- Hamburger button (mobile) -->
    <button
        class="md:hidden text-cream-50 p-2"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label="Toggle menu"
    >
        {#if menuOpen}
            <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        {:else}
            <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        {/if}
    </button>

    <!-- Mobile dropdown menu -->
    {#if menuOpen}
        <div
            class="absolute top-full left-0 right-0 bg-sage-600 md:hidden flex flex-col py-2 px-6 gap-1 shadow-lg z-50"
        >
            <a
                href="/"
                class={getLinkClass("/")}
                onclick={() => (menuOpen = false)}>Home</a
            >
            {#if data.user}
                <a
                    href="/portfolios"
                    class={getLinkClass("/portfolios")}
                    onclick={() => (menuOpen = false)}>Portfolios</a
                >
                <a
                    href="/deposit"
                    class={getLinkClass("/deposit")}
                    onclick={() => (menuOpen = false)}>Deposit</a
                >
                <a
                    href="/rebalance"
                    class={getLinkClass("/rebalance")}
                    onclick={() => (menuOpen = false)}>Rebalance</a
                >
            {:else}
                <span class={getDisabledClass()}>Portfolios</span>
                <span class={getDisabledClass()}>Deposit</span>
                <span class={getDisabledClass()}>Rebalance</span>
            {/if}
            <a
                href="/interest"
                class={getLinkClass("/interest")}
                onclick={() => (menuOpen = false)}>Interest</a
            >
            <a
                href="/retirement"
                class={getLinkClass("/retirement")}
                onclick={() => (menuOpen = false)}>Retirement</a
            >
            {#if data.user}
                <form method="post" action="/logout" use:enhance>
                    <button
                        class={getLinkClass("")}
                        onclick={() => (menuOpen = false)}>Sign out</button
                    >
                </form>
            {:else}
                <a
                    href="/login"
                    class={getLinkClass("/login")}
                    onclick={() => (menuOpen = false)}>Sign in</a
                >
            {/if}
        </div>
    {/if}
</nav>

<div class="p-5">
    {@render children()}
</div>
