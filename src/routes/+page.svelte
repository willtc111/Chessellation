<script lang="ts">
	import { resolve } from "$app/paths";
	import NavBar from "$lib/components/NavBar.svelte";
</script>

<svelte:head>
	<title>Chessellation</title>
</svelte:head>

<NavBar pageName="Home">
	<a href={resolve("/compose")} class="navLink"> Composer </a>
</NavBar>

<main class="mx-auto my-2 flex max-w-160 flex-col items-center justify-center gap-2">
	<div>
		Create teams of chess pieces that compete for safe territory on an infinite chess board, forming
		elaborate and unpredictable patterns.
	</div>

	<div>
		Assemble teams in the composition editor, assigning each team a color and specifying the pieces.
		Then run the composition to see what pattern it creates.
	</div>

	<a href={resolve("/compose")} class="my-2 btn preset-filled-surface-400-600"
		>Compose a Chessellation</a
	>

	<div>Inspired by and based on the concept outlined in the following Numberphile videos:</div>

	<div class="flex flex-col gap-2">
		<iframe
			width="560"
			height="315"
			src="https://www.youtube.com/embed/UiX4CFIiegM?si=lyrS6xRdEj_P00cW"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
		<iframe
			width="560"
			height="315"
			src="https://www.youtube.com/embed/VgmDuBCayPw?si=3KRtw4krRntR_Z4x"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
	</div>

	<div>
		Chessellation expands on this idea by allowing pieces to have any move pattern within a 9x9
		area, as well as teams of multiple different pieces. Each team plays one piece per turn. For
		teams with multiple pieces, the team cycles through its roster in order.
	</div>

	<div>Let me know if you find any particularly interesting patterns!</div>
</main>
