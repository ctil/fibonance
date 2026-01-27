<script lang="ts">
    interface Props {
        value?: number | null;
        label: string;
    }

    const uid = $props.id();

    let { value = $bindable(), label }: Props = $props();
</script>

<label for="{uid}-amount">{label}</label>
<input id="{uid}-amount" type="number" bind:value />
