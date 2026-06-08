<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { Application, Container, Graphics, RenderTexture, Sprite } from "pixi.js";
	import type { Team } from "$lib/teams";

	type Chunk = {
		texture: RenderTexture;
		sprite: Sprite;
	};
	type ChunkUpdates = {
		cx: number;
		cy: number;
		cells: {
			lx: number;
			ly: number;
			team: number
		}[]
	};


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
	const CELL_SIZE = 1;
	const TEAM_COLORS: Record<number, number> = {};

	const CHUNK_SIZE = 64; // Cells per chunk
	const chunks = new Map<string, Chunk>();
	const lastChunkRings = new Map<number, number>();
	const tempGraphics = new Graphics();

	function getChunkKey(cx: number, cy: number) {
		return `${cx},${cy}`;
	}

	function getOrCreateChunk(cx: number, cy: number) {
		const key = getChunkKey(cx, cy);
		if (!chunks.has(key)) {
			const texture = RenderTexture.create({
				width: CHUNK_SIZE * CELL_SIZE,
				height: CHUNK_SIZE * CELL_SIZE,
				scaleMode: "nearest",
			});
			const sprite = new Sprite(texture);
			sprite.x = cx * CHUNK_SIZE * CELL_SIZE;
			sprite.y = cy * CHUNK_SIZE * CELL_SIZE;
			world.addChild(sprite);
			chunks.set(key, { texture, sprite });
		}
		return chunks.get(key)!;
	}

	function getTeamColor(teamId: number): number {
		if (!(teamId in TEAM_COLORS)) {
			// Pull from the decoded teams data
			const hex = data.teams[teamId]?.color ?? "#ffffff";
			TEAM_COLORS[teamId] = parseInt(hex.replace("#", ""), 16);
		}
		return TEAM_COLORS[teamId];
	}

	export function renderChanges(changes: Int32Array) {
		// Group changes by chunk
		const byChunk = new Map<string, ChunkUpdates>();
		for (let i = 0; i < changes.length; i += 3) {
			const x = changes[i];
			const y = changes[i + 1];
			const team = changes[i + 2];

			const cx = Math.floor(x / CHUNK_SIZE);
			const cy = Math.floor(y / CHUNK_SIZE);
			const key = getChunkKey(cx, cy);

			const chunkRing = Math.max(Math.abs(cx), Math.abs(cy));
			lastChunkRings.set(team, chunkRing);

			if (!byChunk.has(key)) {
				byChunk.set(key, { cx, cy, cells: [] });
			}
			byChunk.get(key)!.cells.push({
				lx: x - cx * CHUNK_SIZE,
				ly: y - cy * CHUNK_SIZE,
				team,
			});
			squareCount++;
		}

		// Render each affected chunk
		for (const { cx, cy, cells } of byChunk.values()) {
			const { texture } = getOrCreateChunk(cx, cy);

			tempGraphics.clear();
			for (const { lx, ly, team } of cells) {
				tempGraphics
					.rect(lx * CELL_SIZE, ly * CELL_SIZE, CELL_SIZE, CELL_SIZE)
					.fill(getTeamColor(team));
			}

			app.renderer.render({
				container: tempGraphics,
				target: texture,
				clear: false, // preserve existing pixels!
			});
		}

		// Prune old chunks
		const minRing = Math.min(...lastChunkRings.values());
		for (const [key] of chunks) {
			const [cx, cy] = key.split(",").map(Number);
			const chunkRing = Math.max(Math.abs(cx), Math.abs(cy));
			if (chunkRing < minRing) {
				chunks.delete(key);
			}
		}
	}

	onMount(async () => {
		if (!canvas) {
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
		for (const { texture } of chunks.values()) {
			texture.destroy(true);
		}
		tempGraphics.destroy();
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
