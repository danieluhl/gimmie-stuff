import { Show, SignInButton, SignUpButton } from "@clerk/tanstack-react-start";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { authStateFn } from "#/server/home-fns";

export const Route = createFileRoute("/")({
	component: Home,
	beforeLoad: () => authStateFn(),
	loader: async ({ context }) => {
		const { userId, user, allUsers } = context;

		return { userId: userId, user, allUsers };
	},
});

function Home() {
	const { user, allUsers } = Route.useLoaderData();
	const navigate = useNavigate();

	return (
		<div>
			<Show when="signed-in">
				<div className="mb-8">
					<h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your gift lists and connections
					</p>
				</div>

				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">People</h2>
					<div className="flex">
						{allUsers.map((u) => (
							<Card
								onClick={() =>
									navigate({
										to: "/user/$userId",
										params: { userId: String(u.id) },
									})
								}
								key={u.id}
								className="transition-colors hover:bg-accent py-2 cursor-pointer"
							>
								<CardContent className="flex items-center justify-center">
									<span className="font-medium">{u.name}</span>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			</Show>

			<Show when="signed-out">
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<h1 className="text-3xl font-bold">Welcome to Gimmie Stuff</h1>
					<p className="mt-2 max-w-md text-muted-foreground">
						Create and share gift lists with friends and family
					</p>
					<div className="mt-8 flex gap-3">
						<SignInButton mode="modal">
							<Button>Sign In</Button>
						</SignInButton>
						<SignUpButton mode="modal">
							<Button variant="outline">Sign Up</Button>
						</SignUpButton>
					</div>
				</div>
			</Show>
		</div>
	);
}
