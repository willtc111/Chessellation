<script lang="ts">
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head><title>Chessellation</title></svelte:head>
{@render children()}
