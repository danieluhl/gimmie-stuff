import { auth } from "@clerk/tanstack-react-start/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq, type InferSelectModel } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { db } from "#/db";
import { users } from "#/db/schema";

const authGuardFn = createServerFn().handler(async () => {
	const { isAuthenticated, userId } = await auth();
	if (!isAuthenticated || !userId) {
		throw redirect({ to: "/sign-in" });
	}
	return { currentUserId: userId };
});

const updateUserSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	address: z.string().optional().nullable(),
	birthday: z.string().optional().nullable(),
	anniversary: z.string().optional().nullable(),
	sizes: z.string().optional().nullable(),
	interests: z.string().optional().nullable(),
});

const updateUserFn = createServerFn({ method: "POST" })
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

export const Route = createFileRoute("/user/$userId")({
	component: UserProfile,
	beforeLoad: () => authGuardFn(),
	loader: async ({ params, context }) => {
		const userId = Number(params.userId);
		const { currentUserId } = context;

		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new Error("User not found");
		}

		return { user, isCurrentUser: user.clerkId === currentUserId };
	},
});

function UserEditForm({ user }: { user: InferSelectModel<typeof users> }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof updateUserSchema>>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			id: user.id,
			name: user.name || "",
			address: user.address || "",
			birthday: user.birthday || "",
			anniversary: user.anniversary || "",
			sizes: user.sizes || "",
			interests: user.interests || "",
		},
	});

	const mutation = useMutation({
		mutationFn: updateUserFn,
		onSuccess: () => {
			setOpen(false);
			router.invalidate();
		},
	});

	const handleSubmit = (data: z.infer<typeof updateUserSchema>) => {
		mutation.mutate({ data });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Edit Profile
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Textarea {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="birthday"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Birthday</FormLabel>
										<FormControl>
											<Input type="date" {...field} value={field.value || ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="anniversary"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Anniversary</FormLabel>
										<FormControl>
											<Input type="date" {...field} value={field.value || ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="sizes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sizes</FormLabel>
									<FormControl>
										<Textarea {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="interests"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Interests</FormLabel>
									<FormControl>
										<Textarea {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end pt-4">
							<Button type="submit">Save changes</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function UserProfile() {
	const { user, isCurrentUser } = Route.useLoaderData();

	return (
		<div>
			<Link
				to="/"
				className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeftIcon /> Back
			</Link>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<CardTitle className="text-xl">{user.name}</CardTitle>
					{isCurrentUser && <UserEditForm user={user} />}
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
