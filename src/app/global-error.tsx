"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";
import { createTranslator } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import enMessages from "@/messages/en.json";
import zhMessages from "@/messages/zh.json";

type GlobalErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	const pathname = usePathname();
	const locale = pathname?.startsWith("/zh") ? "zh" : "en";
	const messages = locale === "zh" ? zhMessages : enMessages;
	const t = createTranslator({
		locale,
		messages,
		namespace: "errors.global",
	});

	return (
		<html>
			<body>
				<div className="flex min-h-svh items-center justify-center p-6">
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
								<a href={`/${locale}`}>{t("goHome")}</a>
							</Button>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
