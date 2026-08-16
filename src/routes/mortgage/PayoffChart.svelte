<script lang="ts">
    import type { ClassValue } from "svelte/elements";

    interface Props {
        /** End-of-month balances in cents, paying only the minimum. */
        baseline: number[];
        /** End-of-month balances in cents, with the extra payment applied. */
        withExtra: number[];
        class?: ClassValue;
    }

    let { baseline, withExtra, class: className }: Props = $props();

    // Chart geometry, in SVG user units. The viewBox is fixed and the element
    // scales to its container, so these never need to be measured.
    const W = 800;
    const H = 280;
    // Right padding leaves room for the last x-axis label, which is centred on
    // the final tick and would otherwise be clipped.
    const PAD = { top: 12, right: 26, bottom: 28, left: 58 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const startCents = $derived(baseline[0] ?? 0);
    const maxMonths = $derived(Math.max(baseline.length, 1));

    const x = $derived((month: number) => {
        const t = maxMonths === 0 ? 0 : month / maxMonths;
        return PAD.left + t * plotW;
    });
    const y = $derived((cents: number) => {
        const t = startCents === 0 ? 0 : cents / startCents;
        return PAD.top + (1 - t) * plotH;
    });

    /**
     * Downsample a schedule to at most ~120 points and turn it into a polyline
     * "points" string. Month 0 is the starting balance, which no schedule
     * includes.
     */
    function line(schedule: number[]): string {
        const n = schedule.length;
        if (n === 0) return "";
        const step = Math.max(1, Math.round(maxMonths / 120));
        const pts = [`${x(0)},${y(startCents)}`];
        for (let m = step; m <= n; m += step) {
            pts.push(`${x(m)},${y(schedule[m - 1])}`);
        }
        // Always land on the final point so the payoff is exact.
        pts.push(`${x(n)},${y(schedule[n - 1])}`);
        return pts.join(" ");
    }

    const basePoints = $derived(line(baseline));
    const extraPoints = $derived(line(withExtra));

    // Four horizontal gridlines plus the zero line.
    const yTicks = $derived(
        [0, 0.25, 0.5, 0.75, 1].map((f) => ({
            value: startCents * f,
            y: y(startCents * f),
        })),
    );

    // A year tick roughly every 5 years, so long loans stay readable.
    const xTicks = $derived.by(() => {
        const years = Math.ceil(maxMonths / 12);
        const stepYears = years > 20 ? 5 : years > 10 ? 2 : 1;
        const ticks: { label: string; x: number }[] = [];
        for (let yr = 0; yr <= years; yr += stepYears) {
            ticks.push({ label: `${yr}y`, x: x(yr * 12) });
        }
        return ticks;
    });

    function thousands(cents: number): string {
        return `$${Math.round(cents / 100 / 1000)}k`;
    }
</script>

<div class={className}>
    <svg
        viewBox="0 0 {W} {H}"
        class="h-auto w-full [font-variant-numeric:tabular-nums]"
        role="img"
        aria-label="Remaining balance over time, comparing the minimum payment with your extra payment"
    >
        <!-- gridlines -->
        {#each yTicks as tick (tick.value)}
            <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--color-line-soft)"
                stroke-width="1"
            />
            <text
                x={PAD.left - 8}
                y={tick.y + 4}
                text-anchor="end"
                font-size="12"
                fill="var(--color-ink-faint)"
            >
                {thousands(tick.value)}
            </text>
        {/each}

        <!-- x axis -->
        <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + plotH}
            y2={PAD.top + plotH}
            stroke="var(--color-line)"
            stroke-width="1"
        />
        {#each xTicks as tick (tick.label)}
            <text
                x={tick.x}
                y={H - 8}
                text-anchor="middle"
                font-size="12"
                fill="var(--color-ink-faint)"
            >
                {tick.label}
            </text>
        {/each}

        <!-- minimum payment -->
        {#if basePoints}
            <polyline
                points={basePoints}
                fill="none"
                stroke="var(--color-projection)"
                stroke-width="2"
                stroke-dasharray="5 4"
                stroke-linejoin="round"
            />
        {/if}

        <!-- with your extra -->
        {#if extraPoints}
            <polyline
                points={extraPoints}
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="3"
                stroke-linejoin="round"
            />
        {/if}
    </svg>

    <div class="mt-3 flex gap-5 text-sm text-ink-muted">
        <span class="flex items-center gap-2">
            <span
                class="inline-block h-0.5 w-4 bg-projection"
                style="mask-image: repeating-linear-gradient(to right, #000 0 5px, transparent 5px 9px)"
            ></span>
            Minimum payment
        </span>
        <span class="flex items-center gap-2">
            <span class="inline-block h-0.5 w-4 bg-accent"></span>
            With your extra
        </span>
    </div>
</div>
