import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { users } from "#/db/schema";

export const authGuardFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();
	if (!isAuthenticated || !userId) {
		throw redirect({ to: "/sign-in" });
	}
	return { currentUserId: userId };
});

export const updateUserSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	address: z.string().optional().nullable(),
	birthday: z.string().optional().nullable(),
	anniversary: z.string().optional().nullable(),
	sizes: z.string().optional().nullable(),
	interests: z.string().optional().nullable(),
});

const userProfileQuerySchema = z.object({
	userId: z.number(),
	currentUserId: z.string(),
});

export const updateUserFn = createServerFn({ method: "POST" })
	.inputValidator(updateUserSchema)
	.handler(async ({ data }) => {
		const { isAuthenticated, userId: clerkId } = await auth();
		if (!isAuthenticated) throw new Error("Unauthorized");

		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, data.id))
			.limit(1);

		if (!existingUser || existingUser.clerkId !== clerkId) {
			throw new Error("Unauthorized");
		}

		await db
			.update(users)
			.set({
				name: data.name,
				address: data.address || null,
				birthday: data.birthday || null,
				anniversary: data.anniversary || null,
				sizes: data.sizes || null,
				interests: data.interests || null,
			})
			.where(eq(users.id, data.id));

		return { success: true };
	});

export const loadUserProfileFn = createServerFn()
	.inputValidator(userProfileQuerySchema)
	.handler(async ({ data }) => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, data.userId))
			.limit(1);

		if (!user) {
			throw new Error("User not found");
		}

		return { user, isCurrentUser: user.clerkId === data.currentUserId };
	});
