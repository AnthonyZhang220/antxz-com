"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
	title: string;
	description: string;
	onRetry?: () => void;
	retryLabel?: string;
	className?: string;
};

export function ErrorState({
	title,
	description,
	onRetry,
	retryLabel = "Try again",
	className,
}: ErrorStateProps) {
	return (
		<div className={className}>
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertTitle>{title}</AlertTitle>
				<AlertDescription>{description}</AlertDescription>
			</Alert>
			{onRetry ? (
				<div className="mt-3">
					<Button variant="outline" size="sm" onClick={onRetry}>
						<RefreshCw className="size-4" />
						{retryLabel}
					</Button>
				</div>
			) : null}
		</div>
	);
}
