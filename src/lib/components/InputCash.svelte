<script lang="ts">
  const uid = $props.id();
  let { value = $bindable(), label } = $props();
</script>

<label for="{uid}-amount">{label}</label>
<input id="{uid}-amount" type="number" class="mb-4" bind:value />
