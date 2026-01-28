<script lang="ts">
    interface Props {
        value?: number | null;
        label: string;
    }

    const uid = $props.id();
    let { value = $bindable(), label }: Props = $props();
</script>

<div class="mb-4">
    <label for="{uid}-time">
        {label}
    </label>
    <input
        id="{uid}-time"
        type="number"
        step="1"
        min="0"
        class="px-3"
        bind:value
    />
</div>
