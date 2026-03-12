import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { db } from "#/db";
import { users } from "#/db/schema";

export const Route = createFileRoute("/user/$userId")({
	component: UserProfile,
	beforeLoad: async () => {
		const { isAuthenticated } = await auth();
		if (!isAuthenticated) {
			throw redirect({ to: "/sign-in" });
		}
	},
	loader: async ({ params }) => {
		const userId = Number(params.userId);

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new Error("User not found");
		}

		return { user };
	},
});

function UserProfile() {
	const { user } = Route.useLoaderData();

	return (
		<div>
			<Link
				to="/"
				className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				&larr; Back to all users
			</Link>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">{user.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="space-y-4">
						<div className="flex items-baseline gap-2">
							<dt className="text-sm font-medium text-muted-foreground">ID</dt>
							<dd>{user.id}</dd>
						</div>
						{user.address && (
							<div className="flex items-baseline gap-2">
								<dt className="text-sm font-medium text-muted-foreground">
									Address
								</dt>
								<dd>{user.address}</dd>
							</div>
						)}
						{user.birthday && (
							<div className="flex items-baseline gap-2">
								<dt className="text-sm font-medium text-muted-foreground">
									Birthday
								</dt>
								<dd>{user.birthday}</dd>
							</div>
						)}
						{user.anniversary && (
							<div className="flex items-baseline gap-2">
								<dt className="text-sm font-medium text-muted-foreground">
									Anniversary
								</dt>
								<dd>{user.anniversary}</dd>
							</div>
						)}
						{user.sizes && (
							<div className="flex items-baseline gap-2">
								<dt className="text-sm font-medium text-muted-foreground">
									Sizes
								</dt>
								<dd>{user.sizes}</dd>
							</div>
						)}
						{user.interests && (
							<div className="flex items-baseline gap-2">
								<dt className="text-sm font-medium text-muted-foreground">
									Interests
								</dt>
								<dd>{user.interests}</dd>
							</div>
						)}
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
