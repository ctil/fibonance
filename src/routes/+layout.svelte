<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";
    import { enhance } from "$app/forms";
    import { Menu, X } from "lucide-svelte";
    import NavDropdown from "./NavDropdown.svelte";
    import type { LayoutData } from "./$types";

    let { children, data }: { children: any; data: LayoutData } = $props();
    let menuOpen = $state(false);

    type NavLink = { href: string; label: string; auth?: boolean };
    type NavGroup = { label: string; items: NavLink[] };
    type NavEntry = NavLink | NavGroup;

    const isGroup = (entry: NavEntry): entry is NavGroup => "items" in entry;

    // One source of truth, rendered by both the desktop bar and the mobile
    // sheet. Entries the signed-out visitor cannot reach are dropped rather
    // than greyed out — a disabled link is a dead end you have to discover.
    const nav: NavEntry[] = [
        { href: "/", label: "Home" },
        {
            label: "Investments",
            items: [
                { href: "/portfolios", label: "Portfolios", auth: true },
                { href: "/deposit", label: "Deposit", auth: true },
                { href: "/rebalance", label: "Rebalance", auth: true },
            ],
        },
        {
            label: "Calculators",
            items: [
                { href: "/calculators", label: "Interest" },
                { href: "/retirement", label: "Retirement", auth: true },
            ],
        },
        { href: "/mortgage", label: "Mortgage", auth: true },
        { href: "/taxes", label: "Taxes", auth: true },
        { href: "/profile", label: "Profile", auth: true },
    ];

    const visible = (link: NavLink) => !link.auth || !!data.user;

    let entries = $derived(
        nav
            .map((entry) =>
                isGroup(entry)
                    ? { ...entry, items: entry.items.filter(visible) }
                    : entry,
            )
            .filter((entry) =>
                isGroup(entry) ? entry.items.length > 0 : visible(entry),
            ),
    );

    // Constant weight in every state: bolding the active link shifts the width
    // of the whole bar as you navigate.
    const linkBase =
        "block rounded-control px-3 py-2 text-sm font-medium text-cream-50 " +
        "no-underline transition-colors duration-150 hover:bg-white/10";

    const linkClass = (href: string) =>
        page.url.pathname === href ? `${linkBase} bg-white/15` : linkBase;

    const close = () => (menuOpen = false);
</script>

<svelte:head>
    <title>Fibonance</title>
    <link rel="icon" href={favicon} />
</svelte:head>

{#snippet navLink(link: NavLink)}
    <a
        href={link.href}
        class={linkClass(link.href)}
        aria-current={page.url.pathname === link.href ? "page" : undefined}
        onclick={close}
    >
        {link.label}
    </a>
{/snippet}

{#snippet signOut()}
    {#if data.user}
        <form method="post" action="/logout" use:enhance>
            <button class="{linkBase} w-full text-left" onclick={close}>
                Sign out
            </button>
        </form>
    {:else}
        {@render navLink({ href: "/login", label: "Sign in" })}
    {/if}
{/snippet}

<div class="flex min-h-screen flex-col">
    <nav class="on-chrome relative bg-chrome">
        <div
            class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
        >
            <a
                href="/"
                class="flex shrink-0 items-center gap-2.5 no-underline"
                onclick={close}
            >
                <img src={favicon} alt="" class="h-8 w-8" />
                <span class="type-display text-lg text-cream-50">Fibonance</span
                >
            </a>

            <!-- Desktop -->
            <div class="hidden items-center gap-1 md:flex">
                {#each entries as entry (isGroup(entry) ? entry.label : entry.href)}
                    {#if isGroup(entry)}
                        <NavDropdown label={entry.label} items={entry.items} />
                    {:else}
                        {@render navLink(entry)}
                    {/if}
                {/each}
                {@render signOut()}
            </div>

            <button
                class="rounded-control p-2 text-cream-50 transition-colors hover:bg-white/10 md:hidden"
                onclick={() => (menuOpen = !menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
            >
                {#if menuOpen}
                    <X size={22} />
                {:else}
                    <Menu size={22} />
                {/if}
            </button>
        </div>

        <!-- Mobile -->
        {#if menuOpen}
            <div
                class="absolute inset-x-0 top-full z-50 flex flex-col gap-1 bg-chrome px-4 pt-1 pb-3 shadow-overlay sm:px-6 md:hidden"
            >
                {#each entries as entry (isGroup(entry) ? entry.label : entry.href)}
                    {#if isGroup(entry)}
                        <!-- /85 rather than /70: at 11px this is small text and
                             /70 lands at 3.9:1 on the chrome. -->
                        <p class="type-eyebrow px-3 pt-3 pb-1 text-cream-50/85">
                            {entry.label}
                        </p>
                        {#each entry.items as item (item.href)}
                            <div class="pl-3">{@render navLink(item)}</div>
                        {/each}
                    {:else}
                        {@render navLink(entry)}
                    {/if}
                {/each}
                <div class="mt-2 border-t border-white/15 pt-2">
                    {@render signOut()}
                </div>
            </div>
        {/if}
    </nav>

    <main
        class="mx-auto w-full max-w-6xl grow px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
    >
        {@render children()}
    </main>

    <footer class="border-t border-line">
        <div
            class="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-5 text-xs text-ink-faint sm:px-6 lg:px-8"
        >
            <img src={favicon} alt="" class="h-4 w-4 opacity-60" />
            <span>Fibonance &mdash; planning estimates, not advice.</span>
        </div>
    </footer>
</div>
