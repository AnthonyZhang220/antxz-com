import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-14 sm:px-8 lg:px-10">
			<div className="space-y-3">
				<Skeleton className="h-10 w-56" />
				<Skeleton className="h-5 w-80" />
			</div>
			<div className="grid gap-6 lg:grid-cols-2">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="space-y-4 rounded-xl border p-4">
						<Skeleton className="aspect-video w-full" />
						<Skeleton className="h-7 w-40" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-11/12" />
						<Skeleton className="h-9 w-32" />
					</div>
				))}
			</div>
		</div>
	);
}
