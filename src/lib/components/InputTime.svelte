<script lang="ts">
    interface Props {
        value?: number | null;
        label: string;
    }

    const uid = $props.id();
    let { value = $bindable(), label }: Props = $props();
</script>

<label for="{uid}-time">{label}</label>
<input id="{uid}-time" type="number" step="1" min="0" class="mb-4" bind:value />
