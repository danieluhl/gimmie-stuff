import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border bg-card">
			<div className="page-container flex h-16 items-center justify-between">
				<Link to="/" className="text-lg font-semibold no-underline">
					Gimmie Stuff
				</Link>
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<Show when="signed-in">
						<UserButton />
					</Show>
					<Show when="signed-out">
						<SignInButton mode="modal">
							<Button size="sm">Sign In</Button>
						</SignInButton>
					</Show>
				</div>
			</div>
		</header>
	);
}
