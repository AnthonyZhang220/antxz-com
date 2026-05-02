import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
	return (
		<div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12 sm:px-8 lg:px-10">
			<Skeleton className="h-8 w-40" />
			<div className="space-y-3">
				<Skeleton className="h-10 w-80" />
				<Skeleton className="h-6 w-2/3" />
			</div>
			<Skeleton className="aspect-video w-full" />
			<div className="grid gap-6 lg:grid-cols-12">
				<div className="space-y-4 lg:col-span-8">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-52 w-full" />
				</div>
				<div className="space-y-4 lg:col-span-4">
					<Skeleton className="h-28 w-full" />
					<Skeleton className="h-28 w-full" />
				</div>
			</div>
		</div>
	);
}
