<script lang="ts">
	import { onMount } from "svelte";

	/**
	 * Store the mode for button toggling
	 */
	let mode: string | undefined = $state(undefined);

	onMount(() => {
		mode = localStorage.getItem("mode") || undefined;
		applyMode();
	});

	function changeMode(newMode: string | undefined = undefined) {
		mode = newMode;
		if (mode == undefined) {
			localStorage.removeItem("mode");
		} else {
			localStorage.setItem("mode", mode);
		}
		applyMode();
	}

	function applyMode() {
		let isDark: boolean =
			localStorage.mode === "dark" ||
			(!("mode" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

		document.documentElement.setAttribute("data-mode", isDark ? "dark" : "light");
	}
</script>

<svelte:head>
	<script>
		document.documentElement.setAttribute(
			"data-mode",
			localStorage.mode === "dark" ||
				(!("mode" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
				? "dark"
				: "light"
		);
	</script>
</svelte:head>

<div class="flex flex-col items-center">
	<span>Theme</span>
	<section class="btn-group w-fit gap-1 border border-surface-500 p-2">
		<button onclick={() => changeMode("dark")} disabled={mode == "dark"}> Dark </button>
		<button onclick={() => changeMode("light")} disabled={mode == "light"}> Light </button>
		<button onclick={() => changeMode()} disabled={mode == undefined}> System </button>
	</section>
</div>

<style>
	section > button {
		@apply btn w-full preset-filled-surface-500 btn-sm;
	}
</style>
