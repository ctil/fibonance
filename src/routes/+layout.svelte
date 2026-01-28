<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    let { children } = $props();

    function getLinkClass(path: string) {
        const base = "no-underline py-2 px-3 rounded";
        return page.url.pathname === path
            ? `${base} font-bold bg-sage-200`
            : base;
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav class="my-4 border-b-6 border-sage-200">
    <a href="/deposit" class={getLinkClass("/deposit")}>Deposit</a>
    <a href="/interest" class={getLinkClass("/interest")}>Interest</a>
</nav>

<div class="p-5">
    {@render children()}
</div>
