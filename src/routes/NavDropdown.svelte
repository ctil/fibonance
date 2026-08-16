<script lang="ts">
    import { page } from "$app/state";
    import { ChevronDown } from "lucide-svelte";
    import type { ClassValue } from "svelte/elements";

    type Item = { href: string; label: string };

    let {
        label,
        items,
        class: className,
    }: {
        label: string;
        items: Item[];
        class?: ClassValue;
    } = $props();

    let open = $state(false);
    let container: HTMLDivElement | undefined = $state();

    const active = $derived(items.some((i) => i.href === page.url.pathname));

    // Close whenever navigation happens
    $effect(() => {
        page.url.pathname;
        open = false;
    });

    function onWindowClick(event: MouseEvent) {
        if (open && container && !container.contains(event.target as Node)) {
            open = false;
        }
    }

    function onWindowKeydown(event: KeyboardEvent) {
        if (open && event.key === "Escape") {
            open = false;
        }
    }

    const itemBase =
        "block whitespace-nowrap rounded-control px-3 py-2 text-sm font-medium " +
        "text-cream-50 no-underline transition-colors duration-150 hover:bg-white/10";

    const itemClass = (href: string) =>
        page.url.pathname === href ? `${itemBase} bg-white/15` : itemBase;
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<div class={["on-chrome relative", className]} bind:this={container}>
    <button
        type="button"
        class={[
            "flex cursor-pointer items-center gap-1 rounded-control px-3 py-2 text-sm",
            "font-medium text-cream-50 transition-colors duration-150 hover:bg-white/10",
            active && "bg-white/15",
        ]}
        aria-expanded={open}
        aria-haspopup="true"
        onclick={() => (open = !open)}
    >
        {label}
        <ChevronDown
            size={16}
            class="transition-transform duration-200 {open ? 'rotate-180' : ''}"
        />
    </button>

    {#if open}
        <div
            class="absolute top-full right-0 z-50 mt-1 flex min-w-full flex-col gap-1 rounded-surface bg-chrome-hover p-1 shadow-overlay"
        >
            {#each items as item (item.href)}
                <a
                    href={item.href}
                    class={itemClass(item.href)}
                    aria-current={page.url.pathname === item.href
                        ? "page"
                        : undefined}
                >
                    {item.label}
                </a>
            {/each}
        </div>
    {/if}
</div>
