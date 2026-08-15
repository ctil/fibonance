<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ClassValue } from "svelte/elements";
    import Card from "$lib/components/Card.svelte";
    import FormButtons from "$lib/components/FormButtons.svelte";
    import InputCash from "$lib/components/InputCash.svelte";
    import InputPercent from "$lib/components/InputPercent.svelte";
    import { monthlyPayment, todayISO } from "$lib/mortgage";
    import type { Mortgage } from "$lib/server/db/schema";

    interface Props {
        mortgage?: Mortgage;
        oncancel: () => void;
        errorMessage?: string | null;
        class?: ClassValue;
    }

    let {
        mortgage,
        oncancel,
        errorMessage = null,
        class: className,
    }: Props = $props();

    const action = $derived(mortgage ? "?/update" : "?/create");

    // Seeded through functions so the initial read of `mortgage` isn't treated
    // as a reactive dependency, matching TaxDocumentForm.
    function getInitialName() {
        return mortgage?.name ?? "";
    }
    function getInitialStartDate() {
        return mortgage?.startDate ?? todayISO();
    }
    function getInitialOriginalAmount() {
        return mortgage != null ? mortgage.originalAmount / 100 : null;
    }
    function getInitialInterestRate() {
        return mortgage != null ? mortgage.interestRate / 1000 : null;
    }
    function getInitialTermMonths() {
        return mortgage?.termMonths ?? 360;
    }
    function getInitialPiPayment() {
        return mortgage != null ? mortgage.piPayment / 100 : null;
    }
    function getInitialEscrowPayment() {
        return mortgage != null ? (mortgage.escrowPayment ?? 0) / 100 : null;
    }
    function getInitialCurrentBalance() {
        return mortgage?.currentBalance != null
            ? mortgage.currentBalance / 100
            : null;
    }
    function getInitialBalanceAsOf() {
        return mortgage?.balanceAsOf ?? "";
    }
    function getInitialShowOverride() {
        return mortgage?.currentBalance != null;
    }

    let name = $state(getInitialName());
    let startDate = $state(getInitialStartDate());
    let originalAmount = $state<number | null>(getInitialOriginalAmount());
    let interestRate = $state<number | null>(getInitialInterestRate());
    let termMonths = $state(getInitialTermMonths());
    let piPayment = $state<number | null>(getInitialPiPayment());
    let escrowPayment = $state<number | null>(getInitialEscrowPayment());
    let currentBalance = $state<number | null>(getInitialCurrentBalance());
    let balanceAsOf = $state(getInitialBalanceAsOf());
    let showOverride = $state(getInitialShowOverride());

    // The scheduled payment for the terms entered so far, offered as a
    // one-click fill so P&I rarely has to be typed by hand. Deliberately not
    // auto-applied: the real payment often differs by a few cents from the
    // formula, and an effect would fight the user clearing the field.
    const suggestedPi = $derived.by(() => {
        if (originalAmount == null || interestRate == null || termMonths < 1)
            return null;
        return (
            monthlyPayment(
                Math.round(originalAmount * 100),
                Math.round(interestRate * 1000),
                termMonths,
            ) / 100
        );
    });
</script>

<Card class={className}>
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
            {#if mortgage}
                <input type="hidden" name="id" value={mortgage.id} />
            {/if}
            <input
                type="hidden"
                name="originalAmount"
                value={originalAmount ?? ""}
            />
            <input
                type="hidden"
                name="interestRate"
                value={interestRate ?? ""}
            />
            <input type="hidden" name="piPayment" value={piPayment ?? ""} />
            <input
                type="hidden"
                name="escrowPayment"
                value={escrowPayment ?? ""}
            />
            <input
                type="hidden"
                name="currentBalance"
                value={showOverride ? (currentBalance ?? "") : ""}
            />
            <input
                type="hidden"
                name="balanceAsOf"
                value={showOverride ? balanceAsOf : ""}
            />

            <h3 class="text-lg font-semibold mb-4">
                {mortgage ? "Edit Mortgage" : "New Mortgage"}
            </h3>

            <div class="mb-3">
                <label for="m-name">Name</label>
                <input
                    id="m-name"
                    name="name"
                    type="text"
                    class="px-3"
                    placeholder="Primary home"
                    required
                    bind:value={name}
                />
            </div>

            <div class="mb-3">
                <label for="m-start">First payment date</label>
                <input
                    id="m-start"
                    name="startDate"
                    type="date"
                    class="px-3"
                    required
                    bind:value={startDate}
                />
            </div>

            <InputCash
                label="Original loan amount"
                class="mb-3"
                bind:value={originalAmount}
            />

            <InputPercent
                label="Interest rate (%)"
                step="0.001"
                class="mb-3"
                bind:value={interestRate}
            />

            <div class="mb-3">
                <label for="m-term">Term (months)</label>
                <input
                    id="m-term"
                    name="termMonths"
                    type="number"
                    step="1"
                    min="1"
                    max="600"
                    class="px-3"
                    required
                    bind:value={termMonths}
                />
            </div>

            <InputCash
                label="Monthly principal + interest"
                class="mb-1"
                bind:value={piPayment}
            />
            {#if suggestedPi != null && piPayment !== suggestedPi}
                <p class="text-xs text-cream-600 mb-3">
                    Scheduled payment for these terms is ${suggestedPi.toFixed(
                        2,
                    )}.
                    <button
                        type="button"
                        class="text-sage-600 hover:text-sage-800 underline cursor-pointer"
                        onclick={() => (piPayment = suggestedPi)}>Use it</button
                    >
                </p>
            {:else}
                <div class="mb-3"></div>
            {/if}

            <InputCash
                label="Monthly escrow (taxes + insurance)"
                class="mb-3"
                bind:value={escrowPayment}
            />

            <div class="mb-3 pt-3 border-t border-cream-200">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        class="w-4 h-4 appearance-auto accent-sage-600 cursor-pointer"
                        bind:checked={showOverride}
                    />
                    <span class="text-sm font-medium text-cream-700"
                        >Override the computed balance</span
                    >
                </label>
                {#if showOverride}
                    <p class="text-xs text-cream-600 mt-1 mb-3">
                        Use the balance your servicer shows. Otherwise it is
                        computed by amortizing from the first payment.
                    </p>
                    <InputCash
                        label="Actual balance"
                        class="mb-3"
                        bind:value={currentBalance}
                    />
                    <label for="m-as-of">As of</label>
                    <input
                        id="m-as-of"
                        type="date"
                        class="px-3"
                        bind:value={balanceAsOf}
                    />
                {/if}
            </div>

            {#if errorMessage}
                <p class="text-red-600 text-sm mb-3">{errorMessage}</p>
            {/if}

            <FormButtons
                submitLabel={mortgage ? "Save" : "Create"}
                {oncancel}
            />
        </form>
    {/snippet}
</Card>
