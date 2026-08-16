<script lang="ts">
    import { page } from "$app/state";
    import { authClient } from "$lib/auth-client";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import Field from "$lib/components/Field.svelte";

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

<div class="mx-auto max-w-sm py-8">
    <h1 class="type-display mb-1 text-3xl text-ink">Sign in</h1>
    <p class="mb-7 text-sm text-ink-muted">
        Fibonance is a single-account app. Welcome back.
    </p>

    <Card>
        {#snippet body()}
            <form onsubmit={handleSubmit} class="space-y-4">
                <Field label="Email">
                    {#snippet control(id)}
                        <input
                            {id}
                            name="email"
                            type="email"
                            autocomplete="username"
                            required
                            bind:value={email}
                            class="px-3"
                        />
                    {/snippet}
                </Field>

                <Field label="Password" error={message}>
                    {#snippet control(id)}
                        <input
                            {id}
                            name="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            bind:value={password}
                            class="px-3"
                        />
                    {/snippet}
                </Field>

                <Button type="submit" block disabled={loading} class="mt-2">
                    {loading ? "Signing in…" : "Sign in"}
                </Button>
            </form>
        {/snippet}
    </Card>
</div>
