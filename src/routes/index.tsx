import { Show, SignInButton, SignUpButton } from "@clerk/tanstack-react-start";
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { db } from "#/db";
import { users } from "#/db/schema";

const authStateFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
		throw redirect({
			to: "/sign-in",
		});
	}

	const user = await clerkClient().users.getUser(userId);

	return { userId, firstName: user.firstName };
});

export const Route = createFileRoute("/")({
	component: Home,
	beforeLoad: () => authStateFn(),
	loader: async ({ context }) => {
		const { userId, firstName } = context;

		// check if the user is already in the database
		let [dbUser] = await db
			.select()
			.from(users)
			.where(eq(users.clerkId, userId))
			.limit(1);

		// if we don't have a db user, create a new one
		if (!dbUser) {
			const [newUser] = await db
				.insert(users)
				.values({
					clerkId: userId,
					name: firstName || "unknown",
				})
				.returning();
			dbUser = newUser;
		}

		// fetch all users
		const allUsers = await db.select().from(users);

		return { userId: userId, user: dbUser, allUsers };
	},
});

function Home() {
	const { user, allUsers } = Route.useLoaderData();

	return (
		<div>
			<Show when="signed-in">
				<div className="mb-8">
					<h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your gift lists and connections
					</p>
				</div>

				<section>
					<h2 className="mb-4 text-lg font-semibold">All Users</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{allUsers.map((u) => (
							<Link
								key={u.id}
								to="/user/$userId"
								params={{ userId: String(u.id) }}
								className="no-underline"
							>
								<Card className="transition-colors hover:bg-accent">
									<CardContent className="flex items-center justify-center py-6">
										<span className="font-medium">{u.name}</span>
									</CardContent>
								</Card>
							</Link>
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
