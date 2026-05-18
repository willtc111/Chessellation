<script lang="ts">
	import { convertToInputs } from "$lib/input.js";
	import { Chessellator } from "$lib/wasm/chessellation";
	import { onMount, onDestroy } from "svelte";
	import { Application, Graphics } from "pixi.js";
	import type { Team } from "$lib/teams";
	import LogoLink from "$lib/components/LogoLink.svelte";
	import { resolve } from "$app/paths";
	import { page } from "$app/stores";

	let { data }: { data: { teams: Team[]; error: string } } = $props();

	let chessellator: Chessellator | null = $state(null);
	let error: string | null = $state(null);
	let running = $state(false);
	let rafId: number;
	let squareCount = $state(0);

	let canvas: HTMLCanvasElement;
	let app: Application;

	// Visual settings
	const CELL_SIZE = 10;
	const TEAM_COLORS: Record<number, number> = {};

	function getTeamColor(teamId: number): number {
		if (!(teamId in TEAM_COLORS)) {
			// Pull from the decoded teams data
			const hex = data.teams[teamId]?.color ?? "#ffffff";
			TEAM_COLORS[teamId] = parseInt(hex.replace("#", ""), 16);
		}
		return TEAM_COLORS[teamId];
	}

	onMount(async () => {
		if (!canvas) {
			console.log(canvas);
			return;
		}

		// Set up PixiJS
		app = new Application();
		await app.init({
			canvas,
			resizeTo: canvas.parentElement!,
			backgroundColor: 0x111111,
			antialias: false,
		});

		// Enable panning
		let dragging = false;
		let dragStart = { x: 0, y: 0 };
		let stageStart = { x: 0, y: 0 };

		app.stage.eventMode = "static";
		app.stage.hitArea = app.screen;

		app.stage.on("pointerdown", (e) => {
			dragging = true;
			dragStart = { x: e.clientX, y: e.clientY };
			stageStart = { x: app.stage.x, y: app.stage.y };
		});
		app.stage.on("pointermove", (e) => {
			if (!dragging) return;
			app.stage.x = stageStart.x + (e.clientX - dragStart.x);
			app.stage.y = stageStart.y + (e.clientY - dragStart.y);
		});
		app.stage.on("pointerup", () => (dragging = false));
		app.stage.on("pointerupoutside", () => (dragging = false));

		// Zoom with scroll wheel
		canvas.addEventListener("wheel", (e) => {
			e.preventDefault();
			const scale = e.deltaY < 0 ? 1.1 : 0.9;
			app.stage.scale.x *= scale;
			app.stage.scale.y *= scale;
		});

		// Center the origin and flip the Y axis
		app.stage.x = app.screen.width / 2;
		app.stage.y = app.screen.height / 2;
		app.stage.scale.y = -1;

		// Initialize chessellator
		if (!data.teams) {
			error = data.error ?? "Invalid chessellation URL";
			return;
		}

		try {
			chessellator = Chessellator.new(JSON.stringify(convertToInputs(data.teams)));
		} catch (e) {
			error = `Failed to initialize: ${e}`;
		}
	});

	onDestroy(() => {
		if (rafId) cancelAnimationFrame(rafId);
		app?.destroy();
	});

	function renderChanges(changes: Int32Array) {
		const g = new Graphics();
		for (let i = 0; i < changes.length; i += 3) {
			const x = changes[i];
			const y = changes[i + 1];
			const team = changes[i + 2];
			g.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE).fill(getTeamColor(team));
			squareCount += 1;
		}
		app.stage.addChild(g);
	}

	function step(count: number = 1) {
		if (!chessellator) return;
		for (let steps = 0; steps < count; steps++) {
			chessellator.step();
		}
		const changes = chessellator.flush_changes();
		renderChanges(changes);
	}

	function animate() {
		step(100);
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

<div class="relative h-screen w-screen overflow-hidden">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>
	{#if error}
		<p>{error}</p>
	{:else if chessellator}
		<header
			class="absolute top-0 z-10 mb-1 grid w-full grid-cols-2 items-center bg-surface-50-950 px-4 py-2 sm:grid-cols-3"
		>
			<LogoLink />
			<a
				href={resolve(`/compose?${$page.url.searchParams.toString()}`)}
				class="hidden justify-center sm:flex"
			>
				Back to Composer
			</a>
			<div class="flex justify-end">=</div>
		</header>
		<div class="absolute bottom-0 z-10 flex w-full justify-between gap-2 bg-surface-50-950 p-2">
			<div class="flex gap-2">
				<button onclick={() => step()}>Step</button>
				<button onclick={toggleRun}>{running ? "Pause" : "Run"}</button>
			</div>
			<div>
				<span>{squareCount} pieces</span>
			</div>
		</div>
	{/if}
</div>
