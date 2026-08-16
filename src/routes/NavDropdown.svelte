<script lang="ts">
    import { page } from "$app/state";
    import { ChevronDown } from "lucide-svelte";

    type Item = { href: string; label: string };

    let {
        label,
        items,
        disabled = false,
        class: className = "",
    }: {
        label: string;
        items: Item[];
        disabled?: boolean;
        class?: string;
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

    function itemClass(href: string) {
        const base =
            "block no-underline whitespace-nowrap py-2 px-3 rounded text-cream-50 transition-all duration-200 hover:bg-white/10";
        return page.url.pathname === href
            ? `${base} font-bold bg-white/20`
            : base;
    }
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<div class="relative {className}" bind:this={container}>
    {#if disabled}
        <span
            class="flex items-center gap-1 py-2 px-3 rounded text-cream-50/50 cursor-not-allowed"
        >
            {label}
            <ChevronDown class="w-4 h-4" />
        </span>
    {:else}
        <button
            type="button"
            class="flex items-center gap-1 py-2 px-3 rounded text-cream-50 transition-all duration-200 hover:bg-white/10 {active
                ? 'font-bold bg-white/20'
                : ''}"
            aria-expanded={open}
            aria-haspopup="true"
            onclick={() => (open = !open)}
        >
            {label}
            <ChevronDown
                class="w-4 h-4 transition-transform duration-200 {open
                    ? 'rotate-180'
                    : ''}"
            />
        </button>

        {#if open}
            <div
                class="absolute top-full right-0 mt-1 min-w-full bg-sage-700 rounded shadow-lg py-1 px-1 flex flex-col gap-1 z-50"
            >
                {#each items as item (item.href)}
                    <a href={item.href} class={itemClass(item.href)}>
                        {item.label}
                    </a>
                {/each}
            </div>
        {/if}
    {/if}
</div>
