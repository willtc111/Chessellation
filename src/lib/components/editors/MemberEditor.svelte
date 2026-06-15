<script lang="ts">
	import KernelEditor from "./KernelEditor.svelte";

	let { piece = $bindable(), removeMember, disableRemove } = $props();
</script>

<div
	class="flex w-full flex-col gap-1 rounded-base border border-surface-500 bg-surface-100-900 p-2"
>
	<KernelEditor bind:kernel={piece.kernel} {removeMember} {disableRemove} />
</div>
