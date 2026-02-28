<script lang="ts">
    import { enhance } from "$app/forms";
    import { Trash2 } from "lucide-svelte";

    interface Props {
        action: string;
        name: string;
        id: number;
        confirmMessage: string;
        size?: number;
        class?: string;
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
    class={className}
>
    <input type="hidden" {name} value={id} />
    <button
        type="submit"
        class="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition cursor-pointer"
    >
        <Trash2 {size} />
    </button>
</form>
