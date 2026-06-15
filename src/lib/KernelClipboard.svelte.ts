import type { Kernel } from "$lib/teams";

export const clipboard = $state({
	value: null as Kernel | null,
	get() {
		return this.value;
	},
	set(kernel: Kernel) {
		this.value = kernel;
	},
	isEmpty() {
		return this.value === null;
	},
});
