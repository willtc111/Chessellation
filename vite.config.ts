import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), wasm()],

	test: {
		expect: { requireAssertions: true },

		projects: [
			{
				extends: "./vite.config.ts",

				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.{test,spec}.{js,ts}"],
					exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
				},
			},
		],
	},

	server: {
		watch: {
			ignored: ["!**/rust-wasm/pkg/**"],
		},
	},
});
