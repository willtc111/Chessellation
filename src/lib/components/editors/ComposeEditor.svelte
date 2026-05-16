<script lang="ts">
	import { DEFAULT_MEMBER, type Team } from "$lib/teams";
	import TeamEditor from "./TeamEditor.svelte";

	let { teams = $bindable() } = $props();

	function addTeam() {
		teams.push({ pieces: [DEFAULT_MEMBER] });
	}

	function removeTeam(iTeam: number) {
		teams = teams.filter((e: Team, i: number) => i != iTeam);
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex w-fit justify-between gap-4">
		<h2>Teams</h2>
		<span>{teams.length} / 32</span>
		<button
			class="btn preset-filled"
			onclick={addTeam}
			disabled={teams.length >= 32}
			title="Add team"
		>
			Add Team
		</button>
	</div>

	<div class="flex flex-wrap justify-center gap-4 lg:justify-start">
		{#each teams, iTeam}
			<TeamEditor
				bind:team={teams[iTeam]}
				removeTeam={() => removeTeam(iTeam)}
				disableRemove={teams.length <= 1}
			/>
		{/each}
	</div>
</div>
