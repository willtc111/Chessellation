<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { Application, Container, Graphics } from "pixi.js";
	import type { Team } from "$lib/teams";

	let { data, squareCount = $bindable(0) }: { data: { teams: Team[] }; squareCount: number } =
		$props();

	let canvas: HTMLCanvasElement;
	let app: Application;
	let world: Container;

	// Panning
	let dragging = false;
	let dragStart = { x: 0, y: 0 };
	let stageStart = { x: 0, y: 0 };

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

	export function renderChanges(changes: Int32Array) {
		const g = new Graphics();
		for (let i = 0; i < changes.length; i += 3) {
			const x = changes[i];
			const y = changes[i + 1];
			const team = changes[i + 2];
			g.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE).fill(getTeamColor(team));
			squareCount += 1;
		}
		world.addChild(g);
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

		world = new Container();
		app.stage.addChild(world);

		// Enable panning

		app.stage.eventMode = "static";
		app.stage.hitArea = app.screen;

		app.stage.on("pointerdown", (e) => {
			dragging = true;
			dragStart = { x: e.clientX, y: e.clientY };
			stageStart = { x: world.x, y: world.y };
		});
		app.stage.on("pointermove", (e) => {
			if (!dragging) return;
			world.x = stageStart.x + (e.clientX - dragStart.x);
			world.y = stageStart.y + (e.clientY - dragStart.y);
		});
		app.stage.on("pointerup", () => (dragging = false));
		app.stage.on("pointerupoutside", () => (dragging = false));

		// Zoom with scroll wheel
		canvas.addEventListener("wheel", (e) => {
			e.preventDefault();
			zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
		});

		// Center the origin and flip the Y axis
		world.x = app.screen.width / 2;
		world.y = app.screen.height / 2;
		world.scale.y = -1;
	});

	onDestroy(() => {
		app?.destroy();
	});

	export function zoom(scale: number, x: number, y: number) {
		// Center of the screen in world space
		const cx = (app.screen.width / 2 - world.x) / world.scale.x;
		const cy = (app.screen.height / 2 - world.y) / world.scale.y;

		world.scale.x *= scale;
		world.scale.y *= scale;

		// Adjust position so the center point stays fixed
		world.x = app.screen.width / 2 - cx * world.scale.x;
		world.y = app.screen.height / 2 - cy * world.scale.y;

		if (dragging) {
			stageStart = { x: world.x, y: world.y };
			dragStart = { x: x, y: y };
		}
	}
</script>

<canvas bind:this={canvas} class="block h-full w-full"></canvas>
