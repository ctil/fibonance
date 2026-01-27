<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
    header?: string;
    body: Snippet;
}
let { header, body }: Props = $props();
</script>

<div class="card">
  {#if header}
    <div class="card-header text-center">
      <h3 class="mb-0">{header}</h3>
    </div>
  {/if}
  <div class="card-body">{@render body()}</div>
</div>

<style>
  .card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .card-header {
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .card-body {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
    padding-bottom: var(--space-6);
  }
</style>
