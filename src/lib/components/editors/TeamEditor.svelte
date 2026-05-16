<script lang="ts">
	import { DEFAULT_MEMBER, type Piece } from "$lib/teams";
	import Accordion from "../Accordion.svelte";
	import MemberEditor from "./MemberEditor.svelte";

	let { team = $bindable(), removeTeam, disableRemove } = $props();

	function addMember(event: MouseEvent) {
		// Don't click the accordion, but ensure it is open
		event?.stopPropagation();
		expanded = true;

		let newMember: Piece = DEFAULT_MEMBER;
		team.pieces.push(newMember);
	}

	function removeMember(iMember: number) {
		team.pieces = team.pieces.filter((e: Piece, i: number) => i != iMember);
	}

	let expanded = $state(true);
</script>

<div
	class="flex h-fit w-82 flex-col gap-2 rounded-container border border-surface-500 bg-surface-200-800 p-2"
>
	<div class="flex flex-nowrap items-center justify-between gap-4">
		<div class="input-group flex grow">
			<label class="ig-cell preset-tonal" for="color">Color</label>
			<input
				name="color"
				type="color"
				title="Team color"
				bind:value={team.color}
				class="input ig-input grow"
			/>
		</div>
		<button
			onclick={removeTeam}
			class="btn preset-filled-error-500"
			disabled={disableRemove}
			title="Remove team"
		>
			X
		</button>
	</div>

	<Accordion bind:expanded>
		{#snippet heading()}
			<div class="flex w-full justify-between">
				<h3>Pieces</h3>
				<span>{team.pieces.length} / 8</span>
				<button
					class="btn preset-filled"
					title="Add piece to team"
					onclick={(e) => addMember(e)}
					disabled={team.pieces.length >= 8}
				>
					Add Piece
				</button>
			</div>
		{/snippet}
		<div class="flex flex-col gap-1">
			{#each team.pieces, iMember}
				<MemberEditor
					bind:piece={team.pieces[iMember]}
					removeMember={() => removeMember(iMember)}
					disableRemove={team.pieces.length <= 1}
				/>
			{/each}
		</div>
	</Accordion>
</div>
