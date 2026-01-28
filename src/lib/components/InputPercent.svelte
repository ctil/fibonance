<script lang="ts">
    interface Props {
        value?: number | null;
        label: string;
    }

    const uid = $props.id();
    let { value = $bindable(), label }: Props = $props();
</script>

<div class="mb-4">
    <label for="{uid}-percent">
        {label}
    </label>
    <div class="relative">
        <input
            id="{uid}-percent"
            type="number"
            step="0.1"
            min="0"
            class="pl-3 pr-8"
            bind:value
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-cream-500"
            >%</span
        >
    </div>
</div>
