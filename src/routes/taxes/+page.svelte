<script lang="ts">
    import { enhance } from "$app/forms";
    import { Plus, Pencil, ExternalLink } from "lucide-svelte";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
    import Meter from "$lib/components/Meter.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import TaxDocumentForm from "./TaxDocumentForm.svelte";
    import type { PageData } from "./$types";

    let { data, form }: { data: PageData; form: { message?: string } | null } =
        $props();

    let docs = $derived(data.docs);
    let downloaded = $derived(
        docs.filter((d) => d.status === "downloaded").length,
    );
    let percent = $derived(
        docs.length === 0 ? 0 : (downloaded / docs.length) * 100,
    );

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

<svelte:head>
    <title>Tax documents - Fibonance</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
    <PageHeader eyebrow="Taxes" title="{data.taxYear} tax documents">
        {#snippet actions()}
            <Button onclick={startCreate}>
                <Plus size={16} />
                Add document
            </Button>
        {/snippet}
    </PageHeader>

    {#if creatingNew}
        <div class="mb-6">
            <TaxDocumentForm
                oncancel={cancelForm}
                errorMessage={form?.message}
            />
        </div>
    {/if}

    {#if docs.length > 0}
        <Card class="mb-6">
            {#snippet body()}
                <Meter
                    label="Collected"
                    value="{downloaded} of {docs.length}"
                    {percent}
                />
                {#if downloaded > 0}
                    <form
                        method="post"
                        action="?/uncheckAll"
                        use:enhance
                        class="mt-4 border-t border-line-soft pt-3"
                    >
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            class="-ml-3"
                        >
                            Clear all checkmarks
                        </Button>
                    </form>
                {/if}
            {/snippet}
        </Card>
    {/if}

    <Card flush>
        {#snippet body()}
            {#if docs.length === 0}
                <p class="p-8 text-center text-sm text-ink-faint">
                    No documents tracked for {data.taxYear} yet.
                </p>
            {:else}
                <ul class="divide-y divide-line-soft">
                    {#each docs as doc (doc.id)}
                        <li>
                            {#if editingId === doc.id}
                                <div class="p-4">
                                    <TaxDocumentForm
                                        {doc}
                                        oncancel={cancelForm}
                                        errorMessage={form?.message}
                                    />
                                </div>
                            {:else}
                                <!-- min-h keeps rows the same height whether or
                                     not they carry a note, so the action icons
                                     stay on one line down the page. -->
                                <div
                                    class="flex min-h-14 items-center gap-3 px-4 py-2.5"
                                >
                                    <form
                                        method="post"
                                        action="?/updateStatus"
                                        use:enhance={() => {
                                            return async ({ update }) => {
                                                await update({ reset: false });
                                            };
                                        }}
                                        class="flex shrink-0 items-center"
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={doc.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="status"
                                            value={doc.status === "downloaded"
                                                ? "pending"
                                                : "downloaded"}
                                        />
                                        <input
                                            type="checkbox"
                                            checked={doc.status ===
                                                "downloaded"}
                                            class="h-4 w-4 cursor-pointer rounded-sm"
                                            aria-label="Mark {doc.institution} {doc.docType} as collected"
                                            onchange={(e) =>
                                                e.currentTarget
                                                    .closest("form")
                                                    ?.requestSubmit()}
                                        />
                                    </form>

                                    <div class="min-w-0 flex-1">
                                        <div
                                            class="flex flex-wrap items-baseline gap-x-2"
                                        >
                                            <span
                                                class={[
                                                    "font-medium",
                                                    doc.status === "downloaded"
                                                        ? "text-ink-faint line-through"
                                                        : "text-ink",
                                                ]}
                                            >
                                                {doc.institution}
                                            </span>
                                            <span
                                                class="text-sm text-ink-faint"
                                            >
                                                {doc.docType}
                                            </span>
                                        </div>
                                        {#if doc.notes}
                                            <p
                                                class="mt-0.5 text-xs text-ink-faint"
                                            >
                                                {doc.notes}
                                            </p>
                                        {/if}
                                    </div>

                                    {#if doc.portalUrl}
                                        <a
                                            href={doc.portalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="shrink-0 rounded-control p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                                            aria-label="Open {doc.institution} portal"
                                        >
                                            <ExternalLink size={15} />
                                        </a>
                                    {/if}

                                    <button
                                        class="shrink-0 cursor-pointer rounded-control p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                                        onclick={() => startEdit(doc.id)}
                                        aria-label="Edit {doc.institution} {doc.docType}"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <DeleteButton
                                        action="?/delete"
                                        name="id"
                                        id={doc.id}
                                        confirmMessage={`Delete "${doc.institution} ${doc.docType}"?`}
                                        size={15}
                                        class="shrink-0"
                                    />
                                </div>
                            {/if}
                        </li>
                    {/each}
                </ul>
            {/if}
        {/snippet}
    </Card>
</div>
