import { auth } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { createError } from "h3";
import { z } from "zod";
import { db } from "#/db";
import { users } from "#/db/schema";

type HttpErrorLike = {
	statusCode?: number;
	statusMessage?: string;
};

function isHttpError(error: unknown): error is HttpErrorLike {
	return (
		typeof error === "object" &&
		error !== null &&
		typeof (error as HttpErrorLike).statusCode === "number"
	);
}

export const authGuardFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();
	if (!isAuthenticated || !userId) {
		throw redirect({ to: "/sign-in/$" });
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
		try {
			const { isAuthenticated, userId: clerkId } = await auth();
			if (!isAuthenticated || !clerkId) {
				throw createError({
					statusCode: 401,
					statusMessage: "Authentication required",
					data: { message: "You need to sign in to update a profile." },
				});
			}

			const [existingUser] = await db
				.select()
				.from(users)
				.where(eq(users.id, data.id))
				.limit(1);

			if (!existingUser || existingUser.clerkId !== clerkId) {
				throw createError({
					statusCode: 403,
					statusMessage: "Forbidden",
					data: {
						message: "You do not have permission to update this profile.",
					},
				});
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
		} catch (error) {
			if (isHttpError(error)) {
				throw error;
			}

			console.error("Failed to update user profile", {
				userId: data.id,
				error,
			});
			throw createError({
				statusCode: 500,
				statusMessage: "Could not save profile",
				data: {
					message: "We could not save your profile changes. Please try again.",
				},
			});
		}
	});

export const loadUserProfileFn = createServerFn()
	.inputValidator(userProfileQuerySchema)
	.handler(async ({ data }) => {
		try {
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.id, data.userId))
				.limit(1);

			if (!user) {
				throw createError({
					statusCode: 404,
					statusMessage: "User not found",
					data: {
						message: "That user profile does not exist.",
					},
				});
			}

			return { user, isCurrentUser: user.clerkId === data.currentUserId };
		} catch (error) {
			if (isHttpError(error)) {
				throw error;
			}

			console.error("Failed to load user profile", {
				userId: data.userId,
				error,
			});
			throw createError({
				statusCode: 500,
				statusMessage: "Could not load profile",
				data: {
					message:
						"We could not load this profile right now. Please try again.",
				},
			});
		}
	});
