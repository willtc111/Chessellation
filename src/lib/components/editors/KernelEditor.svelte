<script lang="ts">
	import { applyOffsetsToKernel, emptyKernel, PRESET_OFFSETS } from "$lib/teams";
	let { kernel = $bindable() } = $props();
	let center = $derived(Math.floor(kernel.length / 2));

	function resetKernel() {
		kernel = emptyKernel();
		presetIndex = 0;
	}

	let presetIndex: number | undefined = $state(0);
	function loadPreset() {
		if (presetIndex == undefined) {
			return;
		}
		kernel = applyOffsetsToKernel(PRESET_OFFSETS[presetIndex].offsets, emptyKernel());
	}
	function doCustom() {
		presetIndex = undefined;
	}
</script>

<div class="flex flex-col gap-1">
	<div class="flex flex-nowrap items-center justify-between gap-2">
		<div class="input-group grid-cols-[auto_1fr_auto]">
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

		<button class="btn preset-filled-primary-500" onclick={resetKernel} title="Clear kernel">
			Clear
		</button>
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
								onchange={doCustom}
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
</style>
