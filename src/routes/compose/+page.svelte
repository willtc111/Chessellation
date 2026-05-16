<script lang="ts">
	import ComposeEditor from "$lib/components/editors/ComposeEditor.svelte";
	import LogoLink from "$lib/components/LogoLink.svelte";
	import type { Team } from "$lib/teams";
	import { goto } from "$app/navigation";
	import { convertToInputs, encodeInputs } from "$lib/input";
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let teams: Team[] = $state(data.teams);

	function run() {
		const encoded = encodeInputs(convertToInputs(teams));
		goto(resolve(`/run?v=1&t=${encoded}`));
	}

	let loading = $state(true);
	onMount(async () => {
		setTimeout(() => (loading = false), 10);
	});
</script>

<svelte:head>
	<title>Compose | Chessellation</title>
</svelte:head>

<header
	class="sticky top-0 z-10 mb-1 grid grid-cols-2 items-center bg-surface-50-950 px-4 py-2 sm:grid-cols-3"
>
	<LogoLink />
	<h1 class="hidden justify-center sm:flex">Compose</h1>
	<div class="flex justify-end">=</div>
</header>

{#if !loading}
	<main class="m-2 flex flex-col gap-2" in:fade>
		<button class="btn preset-filled-primary-500" disabled={teams.length == 0} onclick={run}>
			Run Chessellation
		</button>
		<ComposeEditor bind:teams />
	</main>
{/if}

<style>
	h1 {
		@apply text-2xl;
	}
</style>
