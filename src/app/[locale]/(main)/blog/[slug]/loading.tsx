import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
	return (
		<div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
			<Skeleton className="h-12 w-3/4 rounded-lg" />
			<Skeleton className="h-6 w-1/2 rounded-lg" />
			<Skeleton className="h-72 w-full rounded-2xl" />
			<div className="space-y-3">
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-11/12" />
				<Skeleton className="h-5 w-10/12" />
			</div>
		</div>
	);
}
