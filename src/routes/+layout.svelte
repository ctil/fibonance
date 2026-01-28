<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    let { children } = $props();

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

<nav class="bg-sage-600 px-6 py-3 flex items-center justify-between">
    <span class="text-cream-50 text-xl font-semibold">Fibonance</span>
    <div class="flex gap-2">
        <a href="/deposit" class={getLinkClass("/deposit")}>Deposit</a>
        <a href="/interest" class={getLinkClass("/interest")}>Interest</a>
    </div>
</nav>

<div class="p-5">
    {@render children()}
</div>
