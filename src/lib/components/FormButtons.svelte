<script lang="ts">
    interface Props {
        submitLabel?: string;
        oncancel: () => void;
        class?: string;
    }

    let { submitLabel = "Save", oncancel, class: className }: Props = $props();
</script>

<div class={["flex gap-3", className]}>
    <button
        type="submit"
        class="flex-1 bg-sage-600 text-cream-50 px-4 py-2 rounded-md hover:bg-sage-700 transition cursor-pointer"
    >
        {submitLabel}
    </button>
    <button
        type="button"
        class="flex-1 bg-cream-200 text-cream-700 px-4 py-2 rounded-md hover:bg-cream-300 transition cursor-pointer"
        onclick={oncancel}
    >
        Cancel
    </button>
</div>
