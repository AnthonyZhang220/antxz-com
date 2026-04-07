"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function DashboardError({
	error,
	reset,
}: DashboardErrorProps) {
	const t = useTranslations("errors.dashboard");
	const locale = useLocale();

	return (
		<div className="flex min-h-[60vh] items-center justify-center p-6">
			<div className="w-full max-w-xl space-y-4">
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>{t("title")}</AlertTitle>
					<AlertDescription>
						<p>{t("description")}</p>
						{error?.digest ? (
							<p className="mt-2 text-xs opacity-80">
								{t("errorId", { id: error.digest })}
							</p>
						) : null}
					</AlertDescription>
				</Alert>
				<div className="flex gap-2">
					<Button onClick={reset}>
						<RefreshCw className="size-4" />
						{t("tryAgain")}
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/${locale}/dashboard`}>{t("backToDashboard")}</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/${locale}`}>{t("goHome")}</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
