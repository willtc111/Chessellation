<script lang="ts">
	import { convertToInputs } from "$lib/input.js";
	import type { Chessellator } from "$lib/wasm/chessellation";
	import { onMount, onDestroy } from "svelte";
	import type { Team } from "$lib/teams";
	import { resolve } from "$app/paths";
	import { page } from "$app/stores";
	import NavBar from "$lib/components/NavBar.svelte";
	import Visualizer from "$lib/components/Visualizer.svelte";

	let { data }: { data: { teams: Team[]; error: string } } = $props();

	let chessellator: Chessellator | null = $state(null);
	let error: string | null = $state(null);
	let running = $state(false);
	let rafId: number;
	let squareCount = $state(0);
	let visualizer: Visualizer;

	onMount(async () => {
		if (!visualizer) {
			return;
		}

		// Initialize chessellator
		if (!data.teams) {
			error = data.error ?? "Invalid chessellation URL";
			return;
		}

		try {
			const wasm = await import("$lib/wasm/chessellation");
			chessellator = wasm.Chessellator.new(JSON.stringify(convertToInputs(data.teams)));
		} catch (e) {
			error = `Failed to initialize: ${e}`;
		}
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
	});

	function step(count: number = 1) {
		if (!chessellator) return;
		for (let steps = 0; steps < count; steps++) {
			chessellator.step();
		}
		const changes = chessellator.flush_changes();
		visualizer.renderChanges(changes);
	}

	function animate() {
		step(Math.max(10, Math.ceil(Math.sqrt(squareCount))));
		rafId = requestAnimationFrame(animate);
	}

	function toggleRun() {
		if (running) {
			cancelAnimationFrame(rafId);
		} else {
			animate();
		}
		running = !running;
	}
</script>

<svelte:head>
	<title>Run Chessellation</title>
</svelte:head>

<div class="relative h-dvh w-screen overflow-hidden pb-[env(safe-area-inset-bottom)]">
	<Visualizer {data} bind:this={visualizer} bind:squareCount />
	{#if error}
		<p>{error}</p>
	{:else if chessellator}
		<header class="absolute top-0 z-10 w-full">
			<NavBar pageName="Run">
				{#snippet headerLinks()}
					<a href={resolve(`/compose?${$page.url.searchParams.toString()}`)}> Back to Composer </a>
				{/snippet}
				<a href={resolve(`/compose?${$page.url.searchParams.toString()}`)} class="navLink">
					Composer
				</a>
			</NavBar>
		</header>

		<footer
			class="absolute bottom-0 z-10 flex w-full flex-wrap justify-between gap-2 bg-surface-50-950 p-2 select-none"
		>
			<div class="flex gap-2">
				<button class="playBtn" onclick={() => step()}>Step</button>
				<button class="playBtn" onclick={toggleRun}>{running ? "Stop" : "Run"}</button>
			</div>

			<div class="flex justify-center gap-2">
				<button
					class="zoomBtn"
					onclick={() => visualizer.zoom(0.9, window.innerWidth / 2, window.innerHeight / 2)}
				>
					-
				</button>
				<span>Zoom</span>
				<button
					class="zoomBtn"
					onclick={() => visualizer.zoom(1.1, window.innerWidth / 2, window.innerHeight / 2)}
				>
					+
				</button>
			</div>

			<div class="grow text-right sm:grow-0">
				<span
					>{squareCount}
					<span class="inline sm:hidden">pcs</span>
					<span class="hidden sm:inline">pieces</span>
				</span>
			</div>
		</footer>
	{/if}
</div>

<style>
	.playBtn {
		@apply btn h-8 w-12 preset-filled-surface-400-600 text-sm font-bold sm:w-16;
	}
	.zoomBtn {
		@apply btn h-8 w-8 preset-filled-surface-400-600 text-lg font-bold;
	}
</style>
