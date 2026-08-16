<script lang="ts">
    import { enhance } from "$app/forms";
    import { Pencil, Plus } from "lucide-svelte";
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
    import Field from "$lib/components/Field.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import Meter from "$lib/components/Meter.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
    import { buttonClass } from "$lib/components/button";
    import {
        amortize,
        currentBalance,
        formatTerm,
        monthsBetween,
        nextPaymentISO,
        payoffDate,
        solveExtraForMonths,
        todayISO,
    } from "$lib/mortgage";
    import { formatCurrency, formatDate } from "$lib/retirement";
    import { formatAmount } from "$lib/rebalance";
    import type { PageData } from "./$types";
    import MortgageForm from "./MortgageForm.svelte";
    import PayoffChart from "./PayoffChart.svelte";
    import ScenarioTable from "./ScenarioTable.svelte";

    let { data, form }: { data: PageData; form: { message?: string } | null } =
        $props();

    const mortgages = $derived(data.mortgages);

    function getInitialSelectedId() {
        return data.mortgages[0]?.id ?? null;
    }

    let selectedId = $state<number | null>(getInitialSelectedId());
    let editing = $state(false);
    let creating = $state(false);

    const selected = $derived(
        mortgages.find((m) => m.id === selectedId) ?? mortgages[0] ?? null,
    );

    // Dates are fixed for the life of the page render so every derived figure
    // agrees with the others.
    const today = todayISO();
    const nextPayment = nextPaymentISO();

    const PRESETS = [0, 100, 200, 300, 500, 750, 1000];
    const SLIDER_MAX = 3000;

    // Scenario inputs, in dollars for the UI. Seeded from the initially
    // selected mortgage so the server renders the saved extra payment rather
    // than a zero that hydration then corrects.
    function getInitialExtra() {
        const first = data.mortgages[0];
        return (first?.extraPayment ?? 0) / 100;
    }

    let extra = $state(getInitialExtra());
    let lumpAmount = $state<number | null>(null);
    let lumpMonth = $state("");
    let targetMonth = $state("");
    let saveState = $state<"idle" | "saving" | "saved">("idle");

    // Reset the scenario when the user picks a different mortgage.
    let loadedFor = $state<number | null>(getInitialSelectedId());
    $effect(() => {
        if (selected != null && loadedFor !== selected.id) {
            loadedFor = selected.id;
            extra = (selected.extraPayment ?? 0) / 100;
            lumpAmount = null;
            lumpMonth = "";
            targetMonth = "";
        }
    });

    const balance = $derived(
        selected == null ? null : currentBalance(selected, today),
    );

    /** Loan terms with no extra payment, the basis of every scenario. */
    const loan = $derived.by(() => {
        if (selected == null || balance == null || balance === "never")
            return null;
        return {
            balance,
            rate: selected.interestRate,
            payment: selected.piPayment,
        };
    });

    /** A lump sum month expressed as a 1-based offset from the next payment. */
    const lumpSum = $derived.by(() => {
        if (lumpAmount == null || lumpAmount <= 0 || lumpMonth === "")
            return undefined;
        const offset = monthsBetween(nextPayment, `${lumpMonth}-01`);
        return {
            amount: Math.round(lumpAmount * 100),
            month: Math.max(1, offset + 1),
        };
    });

    const baseline = $derived(loan == null ? null : amortize(loan));
    const current = $derived(
        loan == null
            ? null
            : amortize({
                  ...loan,
                  extra: Math.round(extra * 100),
                  lumpSum,
              }),
    );

    const savedMonths = $derived(
        baseline == null ||
            current == null ||
            baseline === "never" ||
            current === "never"
            ? 0
            : baseline.months - current.months,
    );
    const savedInterest = $derived(
        baseline == null ||
            current == null ||
            baseline === "never" ||
            current === "never"
            ? 0
            : baseline.totalInterest - current.totalInterest,
    );

    const barFillPct = $derived(
        baseline == null ||
            current == null ||
            baseline === "never" ||
            current === "never" ||
            baseline.months === 0
            ? 100
            : (current.months / baseline.months) * 100,
    );

    /** Extra needed to pay the loan off by the target month. */
    const targetSolution = $derived.by(() => {
        if (loan == null || targetMonth === "") return null;
        const months = monthsBetween(nextPayment, `${targetMonth}-01`) + 1;
        if (months < 1) return "unreachable" as const;
        const cents = solveExtraForMonths(loan, months);
        return cents == null ? ("unreachable" as const) : cents;
    });

    const totalMonthly = $derived(
        selected == null
            ? 0
            : selected.piPayment +
                  (selected.escrowPayment ?? 0) +
                  Math.round(extra * 100),
    );
</script>

<svelte:head>
    <title>Mortgage - Fibonance</title>
</svelte:head>

<PageHeader
    eyebrow="Mortgage"
    title="Payoff"
    description="What paying extra principal does to the term and the interest."
/>

<div class="w-full">
    {#if mortgages.length === 0 && !creating}
        <div
            class="rounded-surface border border-dashed border-line p-10 text-center"
        >
            <p class="text-sm text-ink-muted">
                Add a mortgage to see early-payoff scenarios.
            </p>
            <Button class="mt-4" onclick={() => (creating = true)}>
                <Plus size={16} />
                Add mortgage
            </Button>
        </div>
    {/if}

    {#if creating}
        <MortgageForm
            class="max-w-md mb-6"
            oncancel={() => (creating = false)}
            errorMessage={form?.message}
        />
    {/if}

    {#if selected != null && !creating}
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- LEFT: loan details and scenario controls -->
            <div class="lg:w-80 shrink-0 flex flex-col gap-6">
                {#if mortgages.length > 1}
                    <Field label="Mortgage">
                        {#snippet control(id)}
                            <select {id} class="px-3" bind:value={selectedId}>
                                {#each mortgages as m (m.id)}
                                    <option value={m.id}>{m.name}</option>
                                {/each}
                            </select>
                        {/snippet}
                    </Field>
                {/if}

                {#if editing}
                    <MortgageForm
                        mortgage={selected}
                        oncancel={() => (editing = false)}
                        errorMessage={form?.message}
                    />
                {:else}
                    <Card header={selected.name}>
                        {#snippet headerActions()}
                            <button
                                class="cursor-pointer rounded-control p-1.5 text-ink-faint transition-colors hover:bg-line-soft hover:text-ink"
                                aria-label="Edit mortgage"
                                onclick={() => (editing = true)}
                            >
                                <Pencil size={16} />
                            </button>
                            <DeleteButton
                                action="?/delete"
                                name="id"
                                id={selected.id}
                                confirmMessage="Delete {selected.name}?"
                            />
                        {/snippet}
                        {#snippet body()}
                            <dl class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">
                                        Current balance
                                    </dt>
                                    <dd class="font-medium tabular-nums">
                                        {balance === "never" || balance == null
                                            ? "—"
                                            : formatAmount(balance, true)}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">Rate</dt>
                                    <dd class="font-medium tabular-nums">
                                        {(selected.interestRate / 1000).toFixed(
                                            3,
                                        )}%
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">
                                        Principal + interest
                                    </dt>
                                    <dd class="font-medium tabular-nums">
                                        {formatAmount(selected.piPayment, true)}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">Escrow</dt>
                                    <dd class="font-medium tabular-nums">
                                        {formatAmount(
                                            selected.escrowPayment ?? 0,
                                            true,
                                        )}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">
                                        Original amount
                                    </dt>
                                    <dd class="font-medium tabular-nums">
                                        {formatAmount(
                                            selected.originalAmount,
                                            true,
                                        )}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-ink-faint">
                                        First payment
                                    </dt>
                                    <dd class="font-medium tabular-nums">
                                        {selected.startDate}
                                    </dd>
                                </div>
                                {#if selected.balanceAsOf}
                                    <div class="flex justify-between">
                                        <dt class="text-ink-faint">
                                            Balance from
                                        </dt>
                                        <dd class="font-medium tabular-nums">
                                            {selected.balanceAsOf}
                                        </dd>
                                    </div>
                                {/if}
                            </dl>
                            <p
                                class="mt-4 border-t border-line-soft pt-3 text-sm text-ink-muted"
                            >
                                Total monthly outlay
                                <span class="font-medium text-ink tabular-nums"
                                    >{formatAmount(totalMonthly, true)}</span
                                >, of which
                                {formatAmount(
                                    selected.escrowPayment ?? 0,
                                    true,
                                )}
                                is escrow and never changes the payoff.
                            </p>
                            <Button
                                variant="secondary"
                                block
                                class="mt-4"
                                onclick={() => (creating = true)}
                            >
                                <Plus size={16} />
                                Add mortgage
                            </Button>
                        {/snippet}
                    </Card>
                {/if}

                <!-- Scenario controls -->
                <form
                    method="post"
                    action="?/saveScenario"
                    use:enhance={() => {
                        saveState = "saving";
                        return async ({ update }) => {
                            await update({ reset: false });
                            saveState = "saved";
                            setTimeout(() => (saveState = "idle"), 2000);
                        };
                    }}
                >
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="extraPayment" value={extra} />
                    <Card header="Scenario">
                        {#snippet body()}
                            <label for="extra-amount"
                                >Extra principal / month</label
                            >
                            <div class="mb-3 flex items-baseline gap-3">
                                <span
                                    class="type-display text-2xl text-accent tabular-nums"
                                    >{formatCurrency(extra)}</span
                                >
                                <input
                                    id="extra-amount"
                                    type="number"
                                    step="25"
                                    min="0"
                                    class="ml-auto w-28 px-3 text-right tabular-nums"
                                    bind:value={extra}
                                />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={SLIDER_MAX}
                                step="25"
                                value={Math.min(extra, SLIDER_MAX)}
                                oninput={(e) =>
                                    (extra = Number(e.currentTarget.value))}
                                class="slider"
                                aria-label="Extra principal per month"
                            />
                            <div class="mt-3 flex flex-wrap gap-1.5">
                                {#each PRESETS as preset (preset)}
                                    <button
                                        type="button"
                                        class={buttonClass(
                                            {
                                                variant: "secondary",
                                                size: "sm",
                                                selected: extra === preset,
                                            },
                                            "text-xs tabular-nums",
                                        )}
                                        onclick={() => (extra = preset)}
                                        >${preset}</button
                                    >
                                {/each}
                            </div>

                            <div class="mt-5 border-t border-line-soft pt-4">
                                <InputCash
                                    label="One-time lump sum"
                                    class="mb-3"
                                    bind:value={lumpAmount}
                                />
                                <label for="lump-month">Applied in</label>
                                <input
                                    id="lump-month"
                                    type="month"
                                    class="px-3"
                                    bind:value={lumpMonth}
                                />
                            </div>

                            <div class="mt-5 border-t border-line-soft pt-4">
                                <label for="target-month"
                                    >Target payoff month</label
                                >
                                <input
                                    id="target-month"
                                    type="month"
                                    class="px-3"
                                    bind:value={targetMonth}
                                />
                                {#if targetSolution === "unreachable"}
                                    <p class="mt-2 text-sm text-danger">
                                        That date can't be reached with extra
                                        principal alone.
                                    </p>
                                {:else if targetSolution != null}
                                    <p class="mt-2 text-sm text-ink-muted">
                                        Needs
                                        <span
                                            class="font-medium text-ink tabular-nums"
                                            >{formatAmount(
                                                targetSolution,
                                                true,
                                            )}</span
                                        >
                                        extra per month.
                                        <button
                                            type="button"
                                            class="cursor-pointer font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
                                            onclick={() =>
                                                (extra = targetSolution / 100)}
                                            >Apply</button
                                        >
                                    </p>
                                {/if}
                            </div>

                            <Button
                                type="submit"
                                block
                                class="mt-5"
                                disabled={saveState === "saving"}
                            >
                                {#if saveState === "saving"}
                                    Saving…
                                {:else if saveState === "saved"}
                                    Saved
                                {:else}
                                    Save extra payment
                                {/if}
                            </Button>
                            <p class="mt-2 text-xs text-ink-faint">
                                Only the extra payment is saved. The lump sum
                                and target date are one-off what-ifs.
                            </p>
                        {/snippet}
                    </Card>
                </form>
            </div>

            <!-- RIGHT: results -->
            <div class="flex-1 min-w-0">
                {#if balance === "never" || baseline === "never" || current === "never"}
                    <div
                        class="rounded-surface border border-danger-line bg-danger-soft p-4 text-danger"
                    >
                        The monthly payment doesn't cover the interest on this
                        balance, so the loan never pays off. Check the rate and
                        the principal + interest amount.
                    </div>
                {:else if loan != null && baseline != null && current != null}
                    <div class="mb-4 grid gap-4 sm:grid-cols-2">
                        <!-- With no extra payment there is nothing saved, so
                             these two say so rather than showing a bare dash. -->
                        <StatCard
                            label="Time reclaimed"
                            value={formatTerm(savedMonths)}
                            tone="positive"
                            empty={savedMonths <= 0}
                            emptyHint="Add an extra payment to pull the payoff date in."
                            subtext="{savedMonths} fewer payments than the minimum"
                        />
                        <StatCard
                            label="Interest saved"
                            value={formatCurrency(savedInterest / 100)}
                            tone="positive"
                            empty={savedInterest <= 0}
                            emptyHint="Add an extra payment to cut the interest."
                            subtext="over the life of the loan"
                        />
                        <StatCard
                            label="Payoff with your extra"
                            value={formatTerm(current.months)}
                            subtext="paid off {formatDate(
                                payoffDate(nextPayment, current.months),
                            )}"
                        />
                        <StatCard
                            label="Payoff at minimum"
                            value={formatTerm(baseline.months)}
                            tone="muted"
                            subtext="paid off {formatDate(
                                payoffDate(nextPayment, baseline.months),
                            )}"
                        />
                    </div>

                    <Card class="mb-4">
                        {#snippet body()}
                            <Meter
                                label="Term you actually pay"
                                value={formatTerm(current.months)}
                                percent={barFillPct}
                                tone="attention"
                                startCaption="Today"
                                endCaption="Minimum payoff · {formatTerm(
                                    baseline.months,
                                )}"
                            />
                            {#if savedMonths > 0}
                                <p
                                    class="mt-3 border-t border-line-soft pt-3 text-sm text-accent"
                                >
                                    {formatTerm(savedMonths)} of payments gone.
                                </p>
                            {/if}
                        {/snippet}
                    </Card>

                    <Card class="mb-4" header="Balance over time">
                        {#snippet body()}
                            <PayoffChart
                                baseline={baseline.schedule}
                                withExtra={current.schedule}
                            />
                        {/snippet}
                    </Card>

                    <Card header="Compare scenarios">
                        {#snippet body()}
                            <ScenarioTable
                                {loan}
                                extra={Math.round(extra * 100)}
                                {nextPayment}
                            />
                            <p class="mt-4 text-xs text-ink-faint">
                                Assumes a fixed rate and that the extra is
                                applied to principal every month starting with
                                the next payment. Real totals differ by a few
                                dollars depending on how your servicer posts
                                payments. Planning estimate, not advice.
                            </p>
                        {/snippet}
                    </Card>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    /* @tailwindcss/forms doesn't style range inputs. */
    .slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: var(--color-line);
        cursor: pointer;
    }
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color-surface);
        border: 3px solid var(--color-accent);
        cursor: pointer;
    }
    .slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--color-surface);
        border: 3px solid var(--color-accent);
        cursor: pointer;
    }
    .slider:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }
</style>
