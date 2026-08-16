<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import Field from "$lib/components/Field.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import { enhance } from "$app/forms";
    import type { ActionData, PageData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
    <title>Profile - Fibonance</title>
</svelte:head>

<div class="mx-auto max-w-xl">
    <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your birthday is used to work out your age at retirement."
    />

    <Card>
        {#snippet body()}
            <form method="post" use:enhance>
                <Field label="Birthday" class="mb-5">
                    {#snippet control(id)}
                        <input
                            {id}
                            type="date"
                            name="birthday"
                            value={data.birthday}
                            class="w-52 px-3"
                        />
                    {/snippet}
                </Field>

                <div class="flex items-center gap-3">
                    <Button type="submit">Save</Button>
                    {#if form?.success}
                        <p class="text-sm text-accent">Birthday saved.</p>
                    {/if}
                </div>
            </form>
        {/snippet}
    </Card>
</div>
