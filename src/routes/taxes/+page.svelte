<script lang="ts">
    import { enhance } from "$app/forms";
    import { untrack } from "svelte";
    import { Plus, Pencil, ExternalLink } from "lucide-svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
    import TaxDocumentForm from "./TaxDocumentForm.svelte";
    import type { PageData } from "./$types";

    let { data, form }: { data: PageData; form: { message?: string } | null } =
        $props();

    let docs = $state(untrack(() => data.docs));

    let editingId: number | null = $state(null);
    let creatingNew = $state(false);

    function startCreate() {
        editingId = null;
        creatingNew = true;
    }

    function startEdit(id: number) {
        creatingNew = false;
        editingId = id;
    }

    function cancelForm() {
        editingId = null;
        creatingNew = false;
    }
</script>

<div class="max-w-3xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{data.taxYear} Tax Documents</h1>
        <button
            class="w-10 h-10 flex items-center justify-center rounded-full bg-sage-600 text-cream-50 hover:bg-sage-700 transition cursor-pointer"
            onclick={startCreate}
            aria-label="Add new document"
        >
            <Plus size={20} />
        </button>
    </div>

    {#if creatingNew}
        <TaxDocumentForm oncancel={cancelForm} errorMessage={form?.message} />
    {/if}

    <div class="text-sm text-gray-500">
        {docs.filter((d) => d.status === "downloaded").length}/{docs.length} downloaded
    </div>
    <Card class="">
        {#snippet body()}
            <div class="space-y-1">
                {#each docs as doc (doc.id)}
                    {#if editingId === doc.id}
                        <div class="py-2">
                            <TaxDocumentForm
                                {doc}
                                oncancel={cancelForm}
                                errorMessage={form?.message}
                            />
                        </div>
                    {:else}
                        <div
                            class="flex items-start gap-3 py-3 border-b border-cream-200 last:border-0"
                        >
                            <form
                                method="post"
                                action="?/updateStatus"
                                use:enhance={() => {
                                    doc.status =
                                        doc.status === "downloaded"
                                            ? "pending"
                                            : "downloaded";
                                    return async ({ update }) => {
                                        await update({ reset: false });
                                    };
                                }}
                                class="shrink-0 flex items-center pt-0.5"
                            >
                                <input type="hidden" name="id" value={doc.id} />
                                <input
                                    type="hidden"
                                    name="status"
                                    value={doc.status === "downloaded"
                                        ? "pending"
                                        : "downloaded"}
                                />
                                <input
                                    type="checkbox"
                                    checked={doc.status === "downloaded"}
                                    class="w-4 h-4 appearance-auto accent-sage-600 cursor-pointer"
                                    onchange={(e) =>
                                        e.currentTarget
                                            .closest("form")
                                            ?.requestSubmit()}
                                />
                            </form>

                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex items-baseline gap-2 flex-wrap"
                                >
                                    <span class="font-medium"
                                        >{doc.institution}</span
                                    >
                                    <span class="text-sm text-gray-500"
                                        >{doc.docType}</span
                                    >
                                </div>
                                {#if doc.notes}
                                    <div class="text-xs text-gray-400 mt-0.5">
                                        {doc.notes}
                                    </div>
                                {/if}
                            </div>

                            {#if doc.portalUrl}
                                <a
                                    href={doc.portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="shrink-0 text-sage-600 hover:text-sage-800"
                                    aria-label="Open portal"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            {/if}

                            <button
                                class="shrink-0 p-1 text-sage-600 hover:text-sage-800 hover:bg-cream-200 rounded transition cursor-pointer"
                                onclick={() => startEdit(doc.id)}
                                aria-label="Edit document"
                            >
                                <Pencil size={14} />
                            </button>

                            <DeleteButton
                                action="?/delete"
                                name="id"
                                id={doc.id}
                                confirmMessage={`Delete "${doc.institution} ${doc.docType}"?`}
                                size={14}
                                class="shrink-0"
                                onsubmit={() => {
                                    docs = docs.filter((d) => d.id !== doc.id);
                                }}
                            />
                        </div>
                    {/if}
                {/each}
            </div>
        {/snippet}
    </Card>
</div>
