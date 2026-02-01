<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
    <title>Sign in - Fibonance</title>
</svelte:head>

<div class="max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-bold text-sage-700 mb-6">Sign in</h1>

    <form method="post" action="?/login" use:enhance class="space-y-4">
        <div>
            <label
                for="username"
                class="block text-sm font-medium text-sage-700 mb-1"
            >
                Username
            </label>
            <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                required
                class="w-full px-3 py-2 border border-sage-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
        </div>

        <div>
            <label
                for="password"
                class="block text-sm font-medium text-sage-700 mb-1"
            >
                Password
            </label>
            <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="w-full px-3 py-2 border border-sage-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
        </div>

        {#if form?.message}
            <p class="text-red-600 text-sm">{form.message}</p>
        {/if}

        <div class="flex gap-3">
            <button
                type="submit"
                class="flex-1 bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition"
            >
                Sign in
            </button>
        </div>
    </form>
</div>
