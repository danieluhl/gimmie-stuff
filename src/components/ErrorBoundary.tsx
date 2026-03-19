import type { ErrorComponentProps } from "@tanstack/react-router";

type ErrorLike = {
	message?: string;
	stack?: string;
	status?: number;
	statusText?: string;
	statusCode?: number;
	statusMessage?: string;
	data?: {
		message?: string;
	};
};

export function ErrorBoundary({ error }: ErrorComponentProps) {
	// Determine if we're in production (no stack traces)
	const isProduction = import.meta.env.PROD;

	// Extract error information
	let errorMessage = "An unexpected error occurred";
	let errorStack: string | undefined;
	let errorStatus: number | undefined;
	let errorStatusText: string | undefined;

	if (error instanceof Error) {
		errorMessage = error.message;
		errorStack = isProduction ? undefined : error.stack;
	} else if (typeof error === "string") {
		errorMessage = error;
	} else if (error && typeof error === "object") {
		// Handle HTTP errors or other error objects
		const errorObj = error as ErrorLike;
		if (typeof errorObj.message === "string") {
			errorMessage = errorObj.message;
		}
		if (typeof errorObj.stack === "string" && !isProduction) {
			errorStack = errorObj.stack;
		}
		if (typeof errorObj.status === "number") {
			errorStatus = errorObj.status;
		}
		if (typeof errorObj.statusText === "string") {
			errorStatusText = errorObj.statusText;
		}
		if (typeof errorObj.statusCode === "number") {
			errorStatus = errorObj.statusCode;
		}
		if (typeof errorObj.statusMessage === "string") {
			errorStatusText = errorObj.statusMessage;
		}
		if (typeof errorObj.data?.message === "string") {
			errorMessage = errorObj.data.message;
		}
	}

	if (errorStatus === 401 && errorMessage === "An unexpected error occurred") {
		errorMessage = "You need to sign in to continue.";
	}

	if (errorStatus === 403 && errorMessage === "An unexpected error occurred") {
		errorMessage = "You do not have permission to perform this action.";
	}

	if (errorStatus === 404 && errorMessage === "An unexpected error occurred") {
		errorMessage = "The requested data could not be found.";
	}

	if (
		errorStatus === 500 &&
		(errorMessage === "An unexpected error occurred" ||
			errorMessage === "Internal Server Error")
	) {
		errorMessage =
			"The server hit a problem while loading data. Please try again.";
	}

	// Log error for debugging
	console.error("Route Error:", error);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
			<div className="space-y-2">
				<div className="text-6xl font-bold text-red-500">⚠</div>
				<h1 className="text-3xl font-bold">Something went wrong</h1>
				<p className="text-lg text-gray-600 dark:text-gray-400">
					We encountered an error while loading this page.
				</p>
			</div>

			<div className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
				<h2 className="mb-2 font-semibold text-red-800 dark:text-red-200">
					Error Details
				</h2>
				<div className="space-y-2 text-left">
					{errorStatus && (
						<p className="text-sm">
							<strong>Status:</strong>{" "}
							<code className="rounded bg-red-100 px-1 py-0.5 text-red-800 dark:bg-red-900 dark:text-red-100">
								{errorStatus}
								{errorStatusText ? ` ${errorStatusText}` : ""}
							</code>
						</p>
					)}
					<p className="text-sm">
						<strong>Message:</strong>{" "}
						<code className="break-all rounded bg-red-100 px-1 py-0.5 text-red-800 dark:bg-red-900 dark:text-red-100">
							{errorMessage}
						</code>
					</p>
					{errorStack && (
						<details className="mt-2">
							<summary className="cursor-pointer text-sm font-semibold text-red-700 dark:text-red-300">
								Stack Trace (Development Only)
							</summary>
							<pre className="mt-2 max-h-64 overflow-auto rounded bg-white p-3 text-xs text-red-900 dark:bg-gray-900 dark:text-red-100">
								{errorStack}
							</pre>
						</details>
					)}
				</div>
			</div>

			<div className="flex gap-3">
				<a
					href="/"
					className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
				>
					Go back home
				</a>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				>
					Try again
				</button>
			</div>
		</div>
	);
}
