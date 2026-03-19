import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { createError } from "h3";
import { db } from "#/db";
import { users } from "#/db/schema";

export const authStateFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
		throw redirect({
			to: "/sign-in/$",
		});
	}

	if (!userId) {
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication required",
			data: { message: "You need to sign in to continue." },
		});
	}

	try {
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
	} catch (error) {
		console.error("Failed to load home data", { userId, error });
		throw createError({
			statusCode: 500,
			statusMessage: "Could not load your dashboard",
			data: {
				message:
					"We could not load your account data right now. Please refresh and try again.",
			},
		});
	}
});
