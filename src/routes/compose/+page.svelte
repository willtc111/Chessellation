<script lang="ts">
	import ComposeEditor from "$lib/components/editors/ComposeEditor.svelte";
	import type { Team } from "$lib/teams";
	import { goto } from "$app/navigation";
	import { convertToInputs, encodeInputs } from "$lib/input";
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import Copyable from "$lib/components/Copyable.svelte";
	import NavBar from "$lib/components/NavBar.svelte";

	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let teams: Team[] = $state(data.teams);

	let encoded = $derived(encodeInputs(convertToInputs(teams)));
	let shareUrl = $derived(`${window.location.origin}${window.location.pathname}?v=1&t=${encoded}`);

	$effect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set("v", "1");
		url.searchParams.set("t", encoded);
		history.replaceState({}, "", url);
	});

	function run() {
		goto(resolve(`/compose/run?v=1&t=${encoded}`));
	}

	let loading = $state(true);
	onMount(async () => {
		setTimeout(() => (loading = false), 10);
	});
</script>

<svelte:head>
	<title>Compose Chessellation</title>
</svelte:head>

<NavBar pageName="Compose">
	<a href={resolve("/compose")} class="navLink"> Composer </a>
</NavBar>

{#if !loading}
	<main class="m-2 flex flex-col gap-2" in:fade>
		<div class="flex flex-col gap-2 sm:flex-row">
			<button class="btn w-50 preset-filled-primary-500" disabled={teams.length == 0} onclick={run}>
				Run Chessellation
			</button>
			<Copyable
				class="btn w-50 preset-filled-primary-500"
				value={shareUrl}
				shownValue="Share Composition"
				copyMessage="Copied Link"
				disabled={teams.length == 0}
			/>
		</div>

		<ComposeEditor bind:teams />
	</main>
{/if}
