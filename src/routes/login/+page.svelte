<script lang="ts">
    import { page } from "$app/state";
    import { authClient } from "$lib/auth-client";

    let email = $state("");
    let password = $state("");
    let message = $state("");
    let loading = $state(false);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        message = "";
        loading = true;

        const result = await authClient.signIn.email({ email, password });

        if (result.error) {
            message = result.error.message ?? "Incorrect email or password";
            loading = false;
        } else {
            const redirectTo =
                page.url.searchParams.get("redirectTo") ?? "/deposit";
            // A full navigation rather than goto(): the root layout load has no
            // url dependency, so a client-side nav would leave the nav bar and
            // the page title showing the signed-out state.
            window.location.href = redirectTo;
        }
    }
</script>

<svelte:head>
    <title>Sign in - Fibonance</title>
</svelte:head>

<div class="max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-bold text-sage-700 mb-6">Sign in</h1>

    <form onsubmit={handleSubmit} class="space-y-4">
        <div>
            <label
                for="email"
                class="block text-sm font-medium text-sage-700 mb-1"
            >
                Email
            </label>
            <input
                id="email"
                name="email"
                type="email"
                autocomplete="username"
                required
                bind:value={email}
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
                bind:value={password}
                class="w-full px-3 py-2 border border-sage-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
            />
        </div>

        {#if message}
            <p class="text-red-600 text-sm">{message}</p>
        {/if}

        <div class="flex gap-3">
            <button
                type="submit"
                disabled={loading}
                class="flex-1 bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition disabled:opacity-60"
            >
                {loading ? "Signing in..." : "Sign in"}
            </button>
        </div>
    </form>
</div>
