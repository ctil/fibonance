<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { page } from "$app/state";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href="/deposit" class:active={page.url.pathname === "/deposit"}>
		Deposit</a
	>
	<a href="/interest" class:active={page.url.pathname === "/interest"}
		>Interest</a
	>
</nav>

<div class="p-5">
	{@render children()}
</div>

<style>
	nav {
		margin: var(--space-4);
		border-bottom: 5px solid var(--color-sage-200);
		a {
			text-decoration: none;
			padding: var(--space-2) var(--space-3);
			border-radius: var(--radius-2);
			&.active {
				font-weight: bold;
				background-color: var(--color-sage-200);
				/* box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); */
			}
		}
	}
</style>
