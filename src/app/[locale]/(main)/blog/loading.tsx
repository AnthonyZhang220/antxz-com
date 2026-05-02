import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function SmallCardSkeleton() {
	return (
		<div className="flex gap-4 py-4.5 border-b border-border/50">
			<Skeleton className="w-36 shrink-0 aspect-3/2 rounded-lg" />
			<div className="flex-1 flex flex-col justify-center gap-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-16 rounded-md" />
					<Skeleton className="h-5 w-14 rounded-md" />
				</div>
				<Skeleton className="h-6 w-4/5 rounded-md" />
				<Skeleton className="h-4 w-full rounded-md" />
				<Skeleton className="h-4 w-11/12 rounded-md" />
				<div className="flex flex-wrap items-center gap-3">
					<Skeleton className="h-3 w-20 rounded-md" />
					<Skeleton className="h-3 w-14 rounded-md" />
					<Skeleton className="h-3 w-10 rounded-md" />
					<Skeleton className="h-3 w-10 rounded-md" />
					<Skeleton className="h-3 w-16 rounded-md" />
				</div>
			</div>
		</div>
	);
}

function FilterSidebarSkeleton() {
	return (
		<div className="w-80 space-y-5 rounded-xl border border-border/60 bg-card p-4">
			<Skeleton className="h-5 w-24 rounded-md" />
			<Skeleton className="h-9 w-full rounded-md" />
			<Skeleton className="h-px w-full" />
			<Skeleton className="h-5 w-20 rounded-md" />
			<div className="space-y-2">
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="h-8 w-full rounded-md" />
				<Skeleton className="h-8 w-4/5 rounded-md" />
			</div>
			<Skeleton className="h-px w-full" />
			<Skeleton className="h-5 w-24 rounded-md" />
			<Skeleton className="h-10 w-full rounded-md" />
			<div className="grid grid-cols-2 gap-2">
				<Skeleton className="h-9 w-full rounded-md" />
				<Skeleton className="h-9 w-full rounded-md" />
			</div>
		</div>
	);
}

export default function BlogLoading() {
	return (
		<main className="min-h-screen bg-background text-base md:text-lg">
			<div className="max-w-5xl mx-auto px-6 py-14">
				<div className="mb-10 space-y-3">
					<Skeleton className="h-5 w-40 rounded-md" />
					<Skeleton className="h-16 w-56 md:h-20 md:w-72 rounded-xl" />
				</div>

				<div className="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-start">
					<div className="lg:hidden">
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>

					<div className="flex-1 min-w-0">
						<div className="rounded-xl overflow-hidden border border-border shadow-sm mb-2">
							<Skeleton className="h-56 md:h-72 w-full" />
							<div className="px-5 pt-4 pb-5 bg-card space-y-3">
								<Skeleton className="h-4 w-48 rounded-md" />
								<Skeleton className="h-8 w-4/5 rounded-md" />
								<Skeleton className="h-4 w-full rounded-md" />
								<Skeleton className="h-4 w-11/12 rounded-md" />
								<div className="flex flex-wrap items-center gap-4">
									<Skeleton className="h-3 w-20 rounded-md" />
									<Skeleton className="h-3 w-16 rounded-md" />
									<Skeleton className="h-3 w-12 rounded-md" />
									<Skeleton className="h-3 w-12 rounded-md" />
									<Skeleton className="h-3 w-16 rounded-md" />
								</div>
							</div>
						</div>

						<SmallCardSkeleton />
						<SmallCardSkeleton />
						<SmallCardSkeleton />

						<div className="flex items-center justify-center gap-2 mt-10 pt-7 border-t border-border/50">
							<Skeleton className="h-8 w-8 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</div>
					</div>

					<Separator
						orientation="vertical"
						className="hidden self-stretch h-auto lg:block"
					/>
					<div className="lg:block lg:sticky lg:top-24 lg:self-start">
						<FilterSidebarSkeleton />
					</div>
				</div>
			</div>
		</main>
	);
}
