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
			team: number;
		}[];
	};

	type Props = {
		data: {
			teams: Team[];
		};
		squareCount: number;
	};

	let { data, squareCount = $bindable(0) }: Props = $props();

	let canvas: HTMLCanvasElement;
	let app: Application;
	let world: Container;

	// Panning
	let dragging = false;
	let dragStart = { x: 0, y: 0 };
	let stageStart = { x: 0, y: 0 };

	// Rendering
	const TEAM_COLORS: Record<number, number> = {};
	const CHUNK_SIZE = 64; // Cells per chunk
	const chunks = new Map<string, Chunk>();
	const lastTeamRings = new Map<number, number>();
	let nextPruneRing = 32;
	const tempGraphics = new Graphics();

	/**
	 * Get the key for a chunk based on its coordinates
	 * @param cx Chunk X coordinate
	 * @param cy Chunk Y coordinate
	 */
	function getChunkKey(cx: number, cy: number) {
		return `${cx},${cy}`;
	}

	/**
	 * Get a chunk by coordinates, creating it if it doesn't exist
	 * @param cx Chunk X coordinate
	 * @param cy Chunk Y coordinate
	 */
	function getOrCreateChunk(cx: number, cy: number) {
		const key = getChunkKey(cx, cy);
		if (!chunks.has(key)) {
			const texture = RenderTexture.create({
				width: CHUNK_SIZE,
				height: CHUNK_SIZE,
				scaleMode: "nearest",
			});
			const sprite = new Sprite(texture);
			sprite.x = cx * CHUNK_SIZE - CHUNK_SIZE / 2;
			sprite.y = cy * CHUNK_SIZE - CHUNK_SIZE / 2;
			world.addChild(sprite);
			chunks.set(key, { texture, sprite });
		}
		return chunks.get(key)!;
	}

	function pruneChunks(minRing: number) {
		for (const [key] of chunks) {
			const [cx, cy] = key.split(",").map(Number);
			const chunkOuterRing = getChunkOuterRing(cx, cy);
			if (chunkOuterRing < minRing) {
				chunks.delete(key);
			}
		}
	}

	function getChunkOuterRing(cx: number, cy: number): number {
		return (Math.max(Math.abs(cx), Math.abs(cy)) + 0.5) * CHUNK_SIZE;
	}

	/**
	 * Get the color for a team, caching it in TEAM_COLORS
	 * @param teamId Team ID
	 */
	function getTeamColor(teamId: number): number {
		if (!(teamId in TEAM_COLORS)) {
			const hex = data.teams[teamId]?.color ?? "#ffffff";
			TEAM_COLORS[teamId] = parseInt(hex.replace("#", ""), 16);
		}
		return TEAM_COLORS[teamId];
	}

	/**
	 * Render changes from the chessellator, updating chunks, rendering changed chunks, and pruning old chunks
	 * @param changes Int32Array of [x, y, teamId, x, y, teamId, ...]
	 */
	export function renderChanges(changes: Int32Array) {
		// Group changes by chunk
		const chunkChanges = new Map<string, ChunkUpdates>();
		for (let i = 0; i < changes.length; i += 3) {
			const x = changes[i];
			const y = changes[i + 1];
			const team = changes[i + 2];

			const cx = Math.floor((x + CHUNK_SIZE / 2) / CHUNK_SIZE);
			const cy = Math.floor((y + CHUNK_SIZE / 2) / CHUNK_SIZE);
			const key = getChunkKey(cx, cy);

			lastTeamRings.set(team, Math.max(Math.abs(x), Math.abs(y)));

			if (!chunkChanges.has(key)) {
				chunkChanges.set(key, { cx, cy, cells: [] });
			}
			chunkChanges.get(key)!.cells.push({
				lx: x - (cx * CHUNK_SIZE - CHUNK_SIZE / 2),
				ly: y - (cy * CHUNK_SIZE - CHUNK_SIZE / 2),
				team,
			});
		}

		// Render each changed chunk
		for (const { cx, cy, cells } of chunkChanges.values()) {
			const { texture } = getOrCreateChunk(cx, cy);

			tempGraphics.clear();
			for (const { lx, ly, team } of cells) {
				tempGraphics.rect(lx, ly, 1, 1).fill(getTeamColor(team));
			}

			app.renderer.render({
				container: tempGraphics,
				target: texture,
				clear: false,
			});
		}
		squareCount += changes.length / 3;

		const minRing = lastTeamRings.values().reduce((a, b) => Math.min(a, b), Infinity);
		if (minRing > nextPruneRing) {
			nextPruneRing += 64;
			pruneChunks(minRing);
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

	/**
	 * Zoom the view, keeping the point (x, y) fixed on the screen
	 * @param scale Zoom scale (e.g. 1.1 to zoom in, 0.9 to zoom out)
	 * @param x Screen X coordinate to zoom around
	 * @param y Screen Y coordinate to zoom around
	 */
	export function zoom(scale: number, x: number, y: number) {
		// Convert screen coordinates to world coordinates
		const cx = (x - world.x) / world.scale.x;
		const cy = (y - world.y) / world.scale.y;

		world.scale.x *= scale;
		world.scale.y *= scale;

		// Adjust position so the center point stays fixed
		world.x = x - cx * world.scale.x;
		world.y = y - cy * world.scale.y;

		if (dragging) {
			stageStart = { x: world.x, y: world.y };
			dragStart = { x: x, y: y };
		}
	}
</script>

<canvas bind:this={canvas} class="block h-full w-full"></canvas>
