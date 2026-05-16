<script lang="ts">
	import { slide } from "svelte/transition";

	let { expanded = $bindable(true), class: className = "", heading, children } = $props();

	let isEmpty = $derived(!children);
</script>

<section class="w-full">
	<button onclick={() => (expanded = !expanded)} class="flex w-full gap-1 select-none">
		<span class="">
			{#if isEmpty}
				<svg height="24px" width="24px" viewBox="-25 -25 50 50" xmlns="http://www.w3.org/2000/svg">
					<circle r="15%" />
				</svg>
			{:else if expanded}
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 -960 960 960"
					><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" /></svg
				>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" width="24px" viewBox="0 -960 960 960"
					><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg
				>
			{/if}
		</span>

		{@render heading()}
	</button>

	{#if expanded}
		<div
			transition:slide={{ duration: 300 }}
			class="overflow-hidden"
			onintrostart={(e) => e.currentTarget.classList.add("transitioning")}
			onintroend={(e) => e.currentTarget.classList.remove("transitioning")}
			onoutrostart={(e) => e.currentTarget.classList.add("transitioning")}
		>
			<div class="pt-2 {className}">
				{@render children?.()}
			</div>
		</div>
	{/if}
</section>

<style>
	svg {
		@apply fill-surface-950-50;
	}
</style>
