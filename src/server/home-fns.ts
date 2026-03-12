import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "#/db";
import { users } from "#/db/schema";

export const authStateFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
		throw redirect({
			to: "/sign-in",
		});
	}

	const user = await clerkClient().users.getUser(userId);

	let [dbUser] = await db
		.select()
		.from(users)
		.where(eq(users.clerkId, userId))
		.limit(1);

	if (!dbUser) {
		const [newUser] = await db
			.insert(users)
			.values({
				clerkId: userId,
				name: user.firstName || "unknown",
			})
			.returning();
		dbUser = newUser;
	}

	const allUsers = await db.select().from(users);

	return { userId, user: dbUser, allUsers };
});
