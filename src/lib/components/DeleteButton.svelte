<script lang="ts">
    import { enhance } from "$app/forms";
    import { Trash2 } from "lucide-svelte";
    import type { ClassValue } from "svelte/elements";

    interface Props {
        action: string;
        name: string;
        id: number;
        confirmMessage: string;
        size?: number;
        class?: ClassValue;
        onsubmit?: () => void;
    }

    let {
        action,
        name,
        id,
        confirmMessage,
        size = 16,
        class: className,
        onsubmit,
    }: Props = $props();
</script>

<form
    method="post"
    {action}
    use:enhance={({ cancel }) => {
        if (!confirm(confirmMessage)) {
            cancel();
            return;
        }
        onsubmit?.();
    }}
    class={["inline-flex", className]}
>
    <input type="hidden" {name} value={id} />
    <!-- Muted at rest: a row of loud red icons reads as a page full of errors.
         The destructive colour appears on hover, when it is about to matter. -->
    <button
        type="submit"
        aria-label="Delete"
        class="cursor-pointer rounded-control p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
    >
        <Trash2 {size} />
    </button>
</form>
