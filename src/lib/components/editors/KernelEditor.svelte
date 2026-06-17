<script lang="ts">
	import { clipboard } from "$lib/KernelClipboard.svelte";
	import {
		applyOffsetsToKernel,
		emptyKernel,
		getKernelOffsets,
		getPresetName,
		PRESET_OFFSETS,
		type Kernel,
	} from "$lib/teams";
	import { onMount } from "svelte";

	let { kernel = $bindable<Kernel>(), removeMember, disableRemove } = $props();
	let center = $derived(Math.floor(kernel.length / 2));
	let presetIndex: number | undefined = $state(undefined);

	function resetKernel() {
		kernel = emptyKernel();
		presetIndex = 0;
	}

	function copyKernel() {
		clipboard.set(kernel);
	}

	function pasteKernel() {
		kernel = clipboard.get() ?? kernel;
		detectPreset();
	}

	function loadPreset() {
		if (presetIndex == undefined) {
			return;
		}
		kernel = applyOffsetsToKernel(PRESET_OFFSETS[presetIndex].offsets, emptyKernel());
	}

	function detectPreset() {
		const presetName = getPresetName(getKernelOffsets(kernel));
		if (presetName != undefined) {
			presetIndex = PRESET_OFFSETS.findIndex((p) => p.name == presetName);
		} else {
			presetIndex = undefined;
		}
	}

	onMount(() => {
		detectPreset();
	});
</script>

<div class="flex flex-col gap-1">
	<div class="controlsRow">
		<div class="input-group grow grid-cols-[auto_1fr_auto]">
			<label class="ig-cell preset-tonal" for="load">Load</label>
			<select
				name="load"
				title="Load preset kernel"
				bind:value={presetIndex}
				onchange={loadPreset}
				class="select ig-input min-w-16 text-sm"
				required
			>
				<option value={undefined} disabled selected hidden={presetIndex != undefined}>Custom</option
				>
				{#each PRESET_OFFSETS as preset, i (i)}
					<option value={i}>{preset.name}</option>
				{/each}
			</select>
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

	<div class="controlsRow">
		<button class="editButton" onclick={copyKernel} title="Copy kernel"> Copy </button>
		<button
			class="editButton"
			onclick={pasteKernel}
			title="Paste kernel"
			disabled={clipboard.isEmpty()}
		>
			Paste
		</button>
		<button class="editButton" onclick={resetKernel} title="Clear kernel"> Clear </button>
	</div>

	<table class="w-fit border-collapse">
		<tbody>
			{#each kernel as row, iRow (iRow)}
				<tr>
					{#each row, iCol (iCol)}
						<td>
							<input
								type="checkbox"
								bind:checked={kernel[iRow][iCol]}
								onchange={detectPreset}
								class="input h-full w-full"
								disabled={iRow == center && iCol == center}
							/>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td {
		@apply aspect-square h-8 w-8 border border-surface-500;
	}
	.controlsRow {
		@apply flex flex-nowrap items-center justify-between gap-2;
	}
	.editButton {
		@apply btn h-8 grow preset-filled-surface-400-600;
	}
</style>
