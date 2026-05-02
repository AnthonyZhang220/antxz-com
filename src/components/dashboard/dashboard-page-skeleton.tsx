import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageSkeletonProps = {
	rows?: number;
};

export function DashboardPageSkeleton({ rows = 4 }: DashboardPageSkeletonProps) {
	return (
		<div className="space-y-6 p-4 lg:p-6">
			<Skeleton className="h-24 w-full rounded-xl" />
			<div className="space-y-3">
				{Array.from({ length: rows }).map((_, idx) => (
					<Skeleton key={idx} className="h-24 w-full rounded-lg" />
				))}
			</div>
		</div>
	);
}
