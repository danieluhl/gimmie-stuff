import type { H3Event } from "h3";
import type { NitroApp } from "nitro/types";

export default defineNitroPlugin((nitroApp: NitroApp) => {
	// Log all errors for debugging
	nitroApp.hooks.hook("error", async (error: Error, { event }: { event?: H3Event }) => {
		const requestInfo = event
			? {
					path: event.path,
					method: event.method,
					host: event.node?.req?.headers?.host,
				}
			: null;

		console.error("[Server Error]", {
			message: error.message,
			stack: error.stack,
			request: requestInfo,
		});
	});
});

// Helper to make TypeScript happy with the plugin export
declare function defineNitroPlugin(
	plugin: (nitro: NitroApp) => void | Promise<void>
): (nitro: NitroApp) => void | Promise<void>;
