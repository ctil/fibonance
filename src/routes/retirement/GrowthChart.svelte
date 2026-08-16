<script lang="ts">
    import type { ClassValue } from "svelte/elements";
    import type { ProjectionPoint } from "$lib/retirement";

    interface Props {
        /** Biweekly projection, starting at year 0 with today's balance. */
        points: ProjectionPoint[];
        /** The portfolio value that ends the projection. */
        targetValue: number;
        class?: ClassValue;
    }

    let { points, targetValue, class: className }: Props = $props();

    // Chart geometry, in SVG user units. The viewBox is fixed and the element
    // scales to its container, so these never need to be measured.
    const W = 800;
    const H = 300;
    // Right padding leaves room for the last x-axis label, which is centred on
    // the final tick and would otherwise be clipped.
    const PAD = { top: 14, right: 30, bottom: 28, left: 62 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const last = $derived(points[points.length - 1]);
    const span = $derived(last?.year || 1);

    /**
     * A round gridline step, so the axis reads $250k rather than $263k. Of the
     * round candidates, the one that comes closest to four gridlines wins.
     */
    function niceStep(range: number, count: number): number {
        if (range <= 0) return 1;
        const exp = Math.pow(10, Math.floor(Math.log10(range / count)));
        const candidates = [1, 2, 2.5, 5, 10].map((c) => c * exp);
        // Compared as ratios, so "twice as many gridlines as asked for" counts
        // the same as half as many; a plain difference favours the coarse end.
        const off = (step: number) => Math.abs(Math.log(range / step / count));
        return candidates.reduce((best, c) => (off(c) < off(best) ? c : best));
    }

    const peak = $derived(Math.max(targetValue, last?.balance ?? 0, 1));
    const yStep = $derived(niceStep(peak, 4));
    // Scale to the peak itself rather than up to the next gridline, so the
    // curve fills the plot instead of hugging the bottom of it.
    const yMax = $derived(peak * 1.04);

    const x = $derived((year: number) => PAD.left + (year / span) * plotW);
    const y = $derived((value: number) => PAD.top + (1 - value / yMax) * plotH);

    /** At most ~160 plotted points; a long horizon has thousands of periods. */
    const sampled = $derived.by(() => {
        if (points.length === 0) return [];
        const stride = Math.max(1, Math.ceil(points.length / 160));
        const out = points.filter((_, i) => i % stride === 0);
        // Always land on the final point so the curve meets the target exactly.
        if (out[out.length - 1] !== last) out.push(last);
        return out;
    });

    const balanceLine = $derived(
        sampled.map((p) => `${x(p.year)},${y(p.balance)}`).join(" "),
    );
    const contributedLine = $derived(
        sampled.map((p) => `${x(p.year)},${y(p.contributed)}`).join(" "),
    );
    // Contributions fill down to the zero line; growth fills the gap between
    // what was paid in and what the portfolio is actually worth.
    const contributedArea = $derived(
        `${x(0)},${y(0)} ${contributedLine} ${x(span)},${y(0)}`,
    );
    const growthArea = $derived(
        `${contributedLine} ${sampled
            .map((p) => `${x(p.year)},${y(p.balance)}`)
            .reverse()
            .join(" ")}`,
    );

    const yTicks = $derived.by(() => {
        const ticks: number[] = [];
        for (let v = 0; v <= yMax; v += yStep) ticks.push(v);
        return ticks;
    });

    const xTicks = $derived.by(() => {
        const stepYears =
            span > 20
                ? 5
                : span > 10
                  ? 2
                  : span > 4
                    ? 1
                    : span > 2
                      ? 0.5
                      : 0.25;
        const ticks: { label: string; x: number }[] = [];
        for (let yr = 0; yr <= span + 1e-9; yr += stepYears) {
            const rounded = Number(yr.toFixed(2));
            ticks.push({ label: `${rounded}y`, x: x(rounded) });
        }
        return ticks;
    });

    function compact(value: number): string {
        const abs = Math.abs(value);
        if (abs >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
        }
        if (abs >= 1000) return `$${Math.round(value / 1000)}k`;
        return `$${Math.round(value)}`;
    }
</script>

<div class={className}>
    <svg
        viewBox="0 0 {W} {H}"
        class="h-auto w-full [font-variant-numeric:tabular-nums]"
        role="img"
        aria-label="Projected portfolio value over time, split into contributions and investment growth"
    >
        <!-- gridlines -->
        {#each yTicks as value (value)}
            <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(value)}
                y2={y(value)}
                stroke="var(--color-line-soft)"
                stroke-width="1"
            />
            <text
                x={PAD.left - 8}
                y={y(value) + 4}
                text-anchor="end"
                font-size="12"
                fill="var(--color-ink-faint)"
            >
                {compact(value)}
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

        {#if sampled.length > 1}
            <!-- what you put in -->
            <polygon points={contributedArea} fill="var(--color-horizon-200)" />
            <!-- what the market adds on top -->
            <polygon points={growthArea} fill="var(--color-meadow-200)" />

            <polyline
                points={contributedLine}
                fill="none"
                stroke="var(--color-projection)"
                stroke-width="2"
                stroke-linejoin="round"
            />
            <polyline
                points={balanceLine}
                fill="none"
                stroke="var(--color-accent)"
                stroke-width="3"
                stroke-linejoin="round"
            />
        {/if}

        <!-- target -->
        <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(targetValue)}
            y2={y(targetValue)}
            stroke="var(--color-attention)"
            stroke-width="1.5"
            stroke-dasharray="5 4"
        />
    </svg>

    <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-muted">
        <span class="flex items-center gap-2">
            <span class="inline-block size-3 rounded-xs bg-horizon-200"></span>
            Contributions
        </span>
        <span class="flex items-center gap-2">
            <span class="inline-block size-3 rounded-xs bg-meadow-200"></span>
            Growth
        </span>
        <span class="flex items-center gap-2">
            <span
                class="inline-block h-0.5 w-4 bg-attention"
                style="mask-image: repeating-linear-gradient(to right, #000 0 5px, transparent 5px 9px)"
            ></span>
            Target
        </span>
    </div>
</div>
