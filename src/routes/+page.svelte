<script lang="ts">
	import { resolve } from "$app/paths";
	import LogoLink from "$lib/components/LogoLink.svelte";
</script>

<header class="mb-1 grid grid-cols-2 items-center bg-surface-50-950 px-4 py-2">
	<LogoLink />

	<div class="flex justify-end">=</div>
</header>

<a href={resolve("/compose")} class="btn preset-filled"> Compose a Chessellation </a>
