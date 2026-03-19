import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function requireBuildEnv(name: string, env: Record<string, string>) {
	if (!env[name]?.trim()) {
		throw new Error(
			`[env] Missing required build-time environment variable: ${name}`,
		);
	}
}

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	requireBuildEnv("VITE_CLERK_PUBLISHABLE_KEY", env);

	return {
		plugins: [
			devtools(),
			nitro({ rollupConfig: { external: [/^@sentry\//] } }),
			tsconfigPaths({ projects: ["./tsconfig.json"] }),
			tailwindcss(),
			tanstackStart(),
			viteReact(),
		],
	};
});

export default config;
