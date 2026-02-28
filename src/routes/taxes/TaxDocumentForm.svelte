<script lang="ts">
    import { enhance } from "$app/forms";
    import Card from "$lib/components/Card.svelte";
    import FormButtons from "$lib/components/FormButtons.svelte";
    import type { TaxDocument } from "$lib/server/db/schema";

    interface Props {
        doc?: TaxDocument;
        oncancel: () => void;
        errorMessage?: string | null;
        class?: string;
    }

    let { doc, oncancel, errorMessage, class: className }: Props = $props();

    function getInitialInstitution() {
        return doc?.institution ?? "";
    }
    function getInitialDocType() {
        return doc?.docType ?? "";
    }
    function getInitialNotes() {
        return doc?.notes ?? "";
    }
    function getInitialPortalUrl() {
        return doc?.portalUrl ?? "";
    }

    let institution = $state(getInitialInstitution());
    let docType = $state(getInitialDocType());
    let notes = $state(getInitialNotes());
    let portalUrl = $state(getInitialPortalUrl());

    let action = $derived(doc ? "?/update" : "?/create");
</script>

<Card class={className ?? ""}>
    {#snippet body()}
        <form
            method="post"
            {action}
            use:enhance={() => {
                return async ({ update, result }) => {
                    if (result.type === "success") {
                        oncancel();
                    }
                    await update();
                };
            }}
        >
            {#if doc}
                <input type="hidden" name="id" value={doc.id} />
            {/if}

            <h3 class="text-lg font-semibold mb-4">
                {doc ? "Edit Document" : "New Document"}
            </h3>

            <div class="mb-3">
                <label for="td-institution">Institution</label>
                <input
                    id="td-institution"
                    name="institution"
                    type="text"
                    required
                    bind:value={institution}
                />
            </div>

            <div class="mb-3">
                <label for="td-docType">Doc Type</label>
                <input
                    id="td-docType"
                    name="docType"
                    type="text"
                    required
                    bind:value={docType}
                />
            </div>

            <div class="mb-3">
                <label for="td-notes">Notes</label>
                <input
                    id="td-notes"
                    name="notes"
                    type="text"
                    bind:value={notes}
                />
            </div>

            <div class="mb-4">
                <label for="td-portalUrl">Portal URL</label>
                <input
                    id="td-portalUrl"
                    name="portalUrl"
                    type="url"
                    bind:value={portalUrl}
                />
            </div>

            {#if errorMessage}
                <p class="text-red-600 text-sm mb-3">{errorMessage}</p>
            {/if}

            <FormButtons submitLabel={doc ? "Save" : "Create"} {oncancel} />
        </form>
    {/snippet}
</Card>
