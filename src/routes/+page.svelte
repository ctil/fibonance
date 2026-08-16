<script lang="ts">
    import fibImage from "$lib/assets/fib.jpg";
</script>

<div class="mx-auto grid max-w-4xl items-center gap-10 py-6 sm:grid-cols-2">
    <div>
        <p class="type-eyebrow mb-3">Fibonance</p>
        <h1 class="type-display text-4xl leading-tight text-ink sm:text-5xl">
            Planning, one number at a time.
        </h1>
        <p class="mt-5 max-w-prose text-ink-muted">
            A financial planning app for portfolio rebalancing, mortgage payoff
            scenarios, retirement targets, and keeping track of tax documents.
        </p>
    </div>

    <figure class="mx-auto w-full max-w-xs sm:mx-0">
        <div
            class="rounded-surface border border-line bg-surface p-3 shadow-surface"
        >
            <img
                src={fibImage}
                alt="Fibonacci, a Cavalier King Charles Spaniel, resting on a blanket"
                class="w-full rounded-[calc(var(--radius-surface)-0.25rem)]"
            />
        </div>
        <figcaption class="mt-3 text-center text-xs text-ink-faint">
            Fibonacci, who the app is named after.
        </figcaption>
    </figure>
</div>
