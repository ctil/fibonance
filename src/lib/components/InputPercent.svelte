<script lang="ts">
    interface Props {
        value?: number | null;
        label: string;
    }

    const uid = $props.id();
    let { value = $bindable(), label }: Props = $props();
</script>

<div class="mb-4">
    <label
        for="{uid}-percent"
        class="block text-sm font-medium text-cream-700 mb-1.5"
    >
        {label}
    </label>
    <div class="relative">
        <input
            id="{uid}-percent"
            type="number"
            step="0.1"
            min="0"
            class="w-full pl-3 pr-8 py-2 bg-cream-50 border border-cream-300 rounded-lg
                   text-cream-900 placeholder-cream-400
                   focus:outline-none focus:ring-2 focus:ring-meadow-400 focus:border-meadow-400
                   transition-colors duration-150"
            bind:value
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-cream-500"
            >%</span
        >
    </div>
</div>
