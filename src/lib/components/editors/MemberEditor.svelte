<script lang="ts">
	import KernelEditor from "./KernelEditor.svelte";

	let { piece = $bindable(), removeMember, disableRemove } = $props();
</script>

<div
	class="flex w-full flex-col gap-1 rounded-base border border-surface-500 bg-surface-100-900 p-2"
>
	<div class="flex flex-nowrap items-center justify-between gap-2">
		<div class="input-group flex grow">
			<label class="ig-cell preset-tonal" for="name">Name</label>
			<input
				name="Name"
				title="Piece name"
				type="text"
				bind:value={piece.name}
				class="input w-32 grow"
			/>
		</div>
		<button
			onclick={removeMember}
			class="btn preset-filled-error-500"
			disabled={disableRemove}
			title="Remove piece"
		>
			X
		</button>
	</div>
	<KernelEditor bind:kernel={piece.kernel} />
</div>
