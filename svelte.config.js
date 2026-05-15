import adapter from "@sveltejs/adapter-cloudflare";
import { tailwindReference } from "./src/preprocessors/tailwindReference.js";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
	},

	preprocess: [tailwindReference(path.resolve("./src/routes/layout.css")), vitePreprocess()],

	kit: {
		paths: {
			base: "/chessellation",
		},
		adapter: adapter({
			platformProxy: {
				configPath: "wrangler.json",
				persist: true,
			},
		}),
	},
};

export default config;
