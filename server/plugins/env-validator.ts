import type { NitroApp } from "nitro/types";

const REQUIRED_RUNTIME_ENV_VARS = [
	"DATABASE_URL",
	"CLERK_SECRET_KEY",
	"VITE_CLERK_PUBLISHABLE_KEY",
] as const;

function validateRuntimeEnv() {
	const missingVars = REQUIRED_RUNTIME_ENV_VARS.filter(
		(name) => !process.env[name]?.trim()
	);

	if (missingVars.length > 0) {
		throw new Error(
			`[env] Missing required runtime environment variables: ${missingVars.join(", ")}`
		);
	}
}

export default defineNitroPlugin((_nitroApp: NitroApp) => {
	validateRuntimeEnv();
});

declare function defineNitroPlugin(
	plugin: (nitro: NitroApp) => void | Promise<void>
): (nitro: NitroApp) => void | Promise<void>;
