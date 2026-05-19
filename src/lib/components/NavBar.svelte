<script lang="ts">
	import LogoLink from "$lib/components/LogoLink.svelte";
	import { fade } from "svelte/transition";
	import { resolve } from "$app/paths";
	import LightSwitch from "./LightSwitch.svelte";

	let { headerLinks = null, children = null, pageName } = $props();

	let isMenuOpen = $state(false);
</script>

<header class="sticky h-16 w-full bg-surface-50-950">
	<div class="flex h-full w-full items-center justify-between gap-4 px-3 py-2">
		<div>
			<a href={resolve("/")}>
				<LogoLink />
			</a>
			<span class="ml-2">
				{pageName}
			</span>
		</div>

		{#if !isMenuOpen}
			<div class="hidden justify-center gap-4 md:flex">
				{#if headerLinks}
					{@render headerLinks()}
				{/if}
			</div>
		{/if}

		<div class="flex justify-end">
			<button
				class="btn aspect-square h-8"
				onclick={() => {
					isMenuOpen = !isMenuOpen;
				}}
			>
				{#if isMenuOpen}
					x
				{:else}
					=
				{/if}
			</button>
		</div>
	</div>
</header>

{#if isMenuOpen}
	<div class="fixed z-50 overscroll-contain bg-amber-500" transition:fade={{ duration: 100 }}>
		<div
			class="flex h-screen w-screen flex-col items-center justify-start gap-8 bg-surface-50-950 pt-8"
		>
			<a href={resolve("/")} class="navLink"> Home </a>
			{#if children}
				{@render children()}
			{/if}
			<LightSwitch />
		</div>
	</div>
{/if}
