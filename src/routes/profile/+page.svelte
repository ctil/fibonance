<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import { enhance } from "$app/forms";
    import type { ActionData, PageData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<Card header="Profile" class="w-[300px]">
    {#snippet body()}
        <form method="post" use:enhance>
            <div class="mb-4">
                <label
                    for="birthday"
                    class="block text-sm font-medium text-gray-700"
                    >Birthday</label
                >
                <input
                    type="date"
                    name="birthday"
                    id="birthday"
                    value={data.birthday}
                    class="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
            <button
                type="submit"
                class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Save
            </button>
            {#if form?.success}
                <p class="mt-2 text-sm text-green-600">
                    Profile updated successfully!
                </p>
            {/if}
        </form>
    {/snippet}
</Card>
