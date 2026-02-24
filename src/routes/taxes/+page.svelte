<script lang="ts">
    import { enhance } from "$app/forms";
    import { untrack } from "svelte";
    import Card from "$lib/components/Card.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    const STATUSES = ["pending", "available", "downloaded"] as const;
    type Status = (typeof STATUSES)[number];

    function nextStatus(current: string): Status {
        const idx = STATUSES.indexOf(current as Status);
        return STATUSES[(idx + 1) % STATUSES.length];
    }

    const STATUS_LABELS: Record<Status, string> = {
        pending: "Pending",
        available: "Available",
        downloaded: "Downloaded",
    };

    const STATUS_CLASSES: Record<Status, string> = {
        pending: "bg-cream-200 text-cream-800",
        available: "bg-blue-100 text-blue-800",
        downloaded: "bg-sage-100 text-sage-800",
    };

    let docs = $state(untrack(() => data.docs));
</script>

<div class="max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">{data.taxYear} Tax Documents</h1>

    <Card class="">
        {#snippet body()}
            <div class="space-y-1">
                {#each docs as doc (doc.id)}
                    {@const status = doc.status as Status}
                    <div
                        class="flex items-start gap-3 py-3 border-b border-cream-200 last:border-0"
                    >
                        <form
                            method="post"
                            action="?/updateStatus"
                            use:enhance={() => {
                                const newStatus = nextStatus(doc.status);
                                doc.status = newStatus;
                                return async ({ update }) => {
                                    await update({ reset: false });
                                };
                            }}
                            class="shrink-0"
                        >
                            <input type="hidden" name="id" value={doc.id} />
                            <input
                                type="hidden"
                                name="status"
                                value={nextStatus(doc.status)}
                            />
                            <button
                                type="submit"
                                class={[
                                    "text-xs font-medium px-2 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80",
                                    STATUS_CLASSES[status] ??
                                        "bg-cream-200 text-cream-800",
                                ]}
                            >
                                {STATUS_LABELS[status] ?? status}
                            </button>
                        </form>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-baseline gap-2 flex-wrap">
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                    />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                        {/if}
                    </div>
                {/each}
            </div>
        {/snippet}
    </Card>

    <div class="text-sm text-gray-500 flex gap-4">
        <span
            >{docs.filter((d) => d.status === "downloaded")
                .length}/{docs.length}
            downloaded</span
        >
        <span
            >{docs.filter((d) => d.status === "available").length} available</span
        >
        <span>{docs.filter((d) => d.status === "pending").length} pending</span>
    </div>
</div>
