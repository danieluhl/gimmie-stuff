import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/$")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<main className="page-wrap px-4 pb-8 pt-14">
			<section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
				<div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
				<div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
				<h1 className="display-title mb-5 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
					Welcome Back
				</h1>
				<p className="mb-6 max-w-prose text-[var(--sea-ink-soft)]">
					Sign in to continue.
				</p>
				<div className="mx-auto max-w-sm">
					<SignIn />
				</div>
			</section>
		</main>
	);
}
