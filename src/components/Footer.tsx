export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-auto border-t border-border bg-card">
			<div className="page-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
				<p className="m-0 text-sm text-muted-foreground">
					&copy; {year} Daniel Uhl. All rights reserved.
				</p>
				<p className="m-0 text-xs uppercase tracking-wider text-muted-foreground">
					Built with TanStack Start
				</p>
			</div>
		</footer>
	);
}
