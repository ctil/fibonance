<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<nav class="m-4 border-b-4 border-sage-200">
    <a
        href="/deposit"
        class="no-underline py-2 px-3 rounded {page.url.pathname === '/deposit'
            ? 'font-bold bg-sage-200'
            : ''}"
    >
        Deposit</a
    >
    <a
        href="/interest"
        class="no-underline py-2 px-3 rounded {page.url.pathname === '/interest'
            ? 'font-bold bg-sage-200'
            : ''}"
    >
        Interest</a
    >
</nav>

<div class="p-5">
    {@render children()}
</div>
