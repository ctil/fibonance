<script lang="ts">
    import { enhance } from "$app/forms";
    import { Pencil, Plus } from "lucide-svelte";
    import Card from "$lib/components/Card.svelte";
    import DeleteButton from "$lib/components/DeleteButton.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import StatCard from "$lib/components/StatCard.svelte";
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

<div class="w-full">
    <h1 class="text-2xl font-bold mb-6">Mortgage Payoff</h1>

    {#if mortgages.length === 0 && !creating}
        <div
            class="bg-white border border-cream-300 rounded-lg shadow-sm p-8 text-center"
        >
            <p class="text-cream-500 mb-4">
                Add a mortgage to see early-payoff scenarios.
            </p>
            <button
                class="bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition cursor-pointer"
                onclick={() => (creating = true)}
            >
                Add mortgage
            </button>
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
                    <div>
                        <label for="mortgage-picker">Mortgage</label>
                        <select
                            id="mortgage-picker"
                            class="px-3"
                            bind:value={selectedId}
                        >
                            {#each mortgages as m (m.id)}
                                <option value={m.id}>{m.name}</option>
                            {/each}
                        </select>
                    </div>
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
                                class="p-1 text-sage-600 hover:text-sage-800 hover:bg-cream-200 rounded transition cursor-pointer"
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
                            <dl class="text-sm space-y-2">
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">
                                        Current balance
                                    </dt>
                                    <dd class="font-medium">
                                        {balance === "never" || balance == null
                                            ? "—"
                                            : formatAmount(balance, true)}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">Rate</dt>
                                    <dd class="font-medium">
                                        {(selected.interestRate / 1000).toFixed(
                                            3,
                                        )}%
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">
                                        Principal + interest
                                    </dt>
                                    <dd class="font-medium">
                                        {formatAmount(selected.piPayment, true)}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">Escrow</dt>
                                    <dd class="font-medium">
                                        {formatAmount(
                                            selected.escrowPayment ?? 0,
                                            true,
                                        )}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">
                                        Original amount
                                    </dt>
                                    <dd class="font-medium">
                                        {formatCurrency(
                                            selected.originalAmount / 100,
                                        )}
                                    </dd>
                                </div>
                                <div class="flex justify-between">
                                    <dt class="text-cream-600">
                                        First payment
                                    </dt>
                                    <dd class="font-medium">
                                        {selected.startDate}
                                    </dd>
                                </div>
                                {#if selected.balanceAsOf}
                                    <div class="flex justify-between">
                                        <dt class="text-cream-600">
                                            Balance from
                                        </dt>
                                        <dd class="font-medium">
                                            {selected.balanceAsOf}
                                        </dd>
                                    </div>
                                {/if}
                            </dl>
                            <p
                                class="mt-4 pt-3 border-t border-cream-200 text-sm text-cream-700"
                            >
                                Total monthly outlay
                                <span class="font-medium text-cream-900"
                                    >{formatAmount(totalMonthly, true)}</span
                                >, of which
                                {formatAmount(
                                    selected.escrowPayment ?? 0,
                                    true,
                                )}
                                is escrow and never changes the payoff.
                            </p>
                            <button
                                class="mt-4 w-full flex items-center justify-center gap-2 bg-cream-200 text-cream-700 px-4 py-2 rounded-md hover:bg-cream-300 transition cursor-pointer"
                                onclick={() => (creating = true)}
                            >
                                <Plus size={16} /> Add mortgage
                            </button>
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
                            <div class="flex items-baseline gap-3 mb-3">
                                <span class="text-2xl font-bold text-meadow-700"
                                    >{formatCurrency(extra)}</span
                                >
                                <input
                                    id="extra-amount"
                                    type="number"
                                    step="25"
                                    min="0"
                                    class="px-3 w-28 ml-auto text-right"
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
                            <div class="flex flex-wrap gap-1.5 mt-3">
                                {#each PRESETS as preset (preset)}
                                    <button
                                        type="button"
                                        class="text-xs rounded-full px-3 py-1 border transition cursor-pointer {extra ===
                                        preset
                                            ? 'bg-sage-600 border-sage-600 text-cream-50'
                                            : 'bg-cream-50 border-cream-300 text-cream-700 hover:border-sage-500'}"
                                        onclick={() => (extra = preset)}
                                        >${preset}</button
                                    >
                                {/each}
                            </div>

                            <div class="mt-5 pt-4 border-t border-cream-200">
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

                            <div class="mt-5 pt-4 border-t border-cream-200">
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
                                    <p class="text-sm text-red-600 mt-2">
                                        That date can't be reached with extra
                                        principal alone.
                                    </p>
                                {:else if targetSolution != null}
                                    <p class="text-sm text-cream-700 mt-2">
                                        Needs
                                        <span class="font-medium"
                                            >{formatAmount(
                                                targetSolution,
                                                true,
                                            )}</span
                                        >
                                        extra per month.
                                        <button
                                            type="button"
                                            class="text-sage-600 hover:text-sage-800 underline cursor-pointer"
                                            onclick={() =>
                                                (extra = targetSolution / 100)}
                                            >Apply</button
                                        >
                                    </p>
                                {/if}
                            </div>

                            <button
                                type="submit"
                                disabled={saveState === "saving"}
                                class="mt-5 w-full rounded-md px-4 py-2 text-sm font-medium text-cream-50 transition-colors cursor-pointer {saveState ===
                                'saved'
                                    ? 'bg-meadow-600'
                                    : 'bg-sage-600 hover:bg-sage-700'}"
                            >
                                {#if saveState === "saving"}
                                    Saving...
                                {:else if saveState === "saved"}
                                    Saved!
                                {:else}
                                    Save extra payment
                                {/if}
                            </button>
                            <p class="text-xs text-cream-500 mt-2">
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
                        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        The monthly payment doesn't cover the interest on this
                        balance, so the loan never pays off. Check the rate and
                        the principal + interest amount.
                    </div>
                {:else if loan != null && baseline != null && current != null}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <StatCard
                            label="Time reclaimed"
                            value={savedMonths > 0
                                ? formatTerm(savedMonths)
                                : "—"}
                            valueClass="text-meadow-700"
                            subtext="{savedMonths} fewer payments than the minimum"
                        />
                        <StatCard
                            label="Interest saved"
                            value={savedInterest > 0
                                ? formatCurrency(savedInterest / 100)
                                : "—"}
                            valueClass="text-chestnut-600"
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
                            valueClass="text-cream-600"
                            subtext="paid off {formatDate(
                                payoffDate(nextPayment, baseline.months),
                            )}"
                        />
                    </div>

                    <!-- Term bar -->
                    <div
                        class="bg-white border border-cream-300 rounded-lg shadow-sm p-5 mb-4"
                    >
                        <div
                            class="flex justify-between text-xs text-cream-600 mb-2"
                        >
                            <span class="uppercase tracking-wide font-medium"
                                >Today</span
                            >
                            <span
                                >Minimum payoff · {formatTerm(
                                    baseline.months,
                                )}</span
                            >
                        </div>
                        <div
                            class="relative w-full bg-cream-100 rounded-full h-8 overflow-hidden"
                        >
                            <div
                                class="bg-meadow-500 h-8 rounded-full transition-all duration-300 flex items-center px-3"
                                style="width: {barFillPct}%"
                            >
                                {#if barFillPct > 30}
                                    <span
                                        class="text-xs text-cream-50 font-medium whitespace-nowrap"
                                        >You pay · {formatTerm(
                                            current.months,
                                        )}</span
                                    >
                                {/if}
                            </div>
                        </div>
                        {#if savedMonths > 0}
                            <p class="text-xs text-meadow-700 mt-2 text-right">
                                {formatTerm(savedMonths)} of payments gone
                            </p>
                        {/if}
                    </div>

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
                            <p class="text-xs text-cream-500 mt-4">
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
        background: var(--color-cream-300);
        cursor: pointer;
    }
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--color-cream-50);
        border: 3px solid var(--color-sage-600);
        cursor: pointer;
    }
    .slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--color-cream-50);
        border: 3px solid var(--color-sage-600);
        cursor: pointer;
    }
    .slider:focus-visible {
        outline: 2px solid var(--color-meadow-400);
        outline-offset: 2px;
    }
</style>
