"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getCookie } from "@/lib/shared/cookies";
import { savePreferences } from "@/lib/actions/user-preferences";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";
import { AppLocale, AppRegion } from "@/lib/user/preferences";

export default function PreferencesForm() {
	const t = useTranslations("preferences");
	const tt = useTranslations();
	const router = useRouter();
	const params = useParams<{ locale?: string }>();
	const searchParams = useSearchParams();
	const saveErrorMessage = tt("toast.preferences.error");
	const saveSuccessMessage = tt("toast.preferences.success");
	// Language 从 URL params 获取（正确方式）
	const currentLocale = params?.locale ?? "en";

	const [locale, setLocale] = useState<AppLocale>(currentLocale as AppLocale);
	const [region, setRegion] = useState<AppRegion>(() => {
		const savedRegion = getCookie("preferred_region");
		if (savedRegion) return savedRegion as AppRegion;
		return typeof window !== "undefined" && navigator.language?.startsWith("zh")
			? "cn"
			: "global";
	});
	const [isLoading, setIsLoading] = useState(false);

	function getRedirectPath(nextLocale: string) {
		const redirectParam = searchParams.get("redirect");

		if (
			!redirectParam ||
			!redirectParam.startsWith("/") ||
			redirectParam.startsWith("//")
		) {
			return `/${nextLocale}`;
		}

		return redirectParam.replace(/^\/(en|zh)(?=\/|$)/, `/${nextLocale}`);
	}

	async function onSave(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);
		const loadingToastId = startLoading(tt("toast.preferences.saving"));

		try {
			const result = await savePreferences(
				locale as AppLocale,
				region as AppRegion,
			);

			if (!result.success) {
				finishLoadingError(loadingToastId, result.error || saveErrorMessage);
				return;
			}

			finishLoadingSuccess(loadingToastId, saveSuccessMessage);
			// 延迟重定向，让用户看到成功提示
			await new Promise((resolve) => setTimeout(resolve, 2000));
			router.push(getRedirectPath(locale));
		} catch (error) {
			const message =
				error instanceof Error && error.message
					? error.message
					: saveErrorMessage;
			finishLoadingError(loadingToastId, message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="min-h-screen flex items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{t("title")}</CardTitle>
					<CardDescription>{t("description")}</CardDescription>
				</CardHeader>
				<form onSubmit={onSave}>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="locale">{t("languageLabel")}</Label>
							<Select
								value={locale}
								onValueChange={(value) => setLocale(value as AppLocale)}
								disabled={isLoading}
							>
								<SelectTrigger id="locale" className="w-full">
									<SelectValue placeholder={t("languageLabel")} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="zh">中文</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="region">{t("regionLabel")}</Label>
							<Select
								value={region}
								onValueChange={(value) => setRegion(value as AppRegion)}
								disabled={isLoading}
							>
								<SelectTrigger id="region" className="w-full">
									<SelectValue placeholder={t("regionLabel")} />
								</SelectTrigger>
								<SelectContent>
									{locale === "zh" ? (
										<>
											<SelectItem value="cn">中国</SelectItem>
											<SelectItem value="us">美国</SelectItem>
											<SelectItem value="global">全球</SelectItem>
										</>
									) : (
										<>
											<SelectItem value="cn">China</SelectItem>
											<SelectItem value="us">United States</SelectItem>
											<SelectItem value="global">Global</SelectItem>
										</>
									)}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
					<CardFooter className="justify-end">
						<Button type="submit" disabled={isLoading}>
							{isLoading ? tt("toast.preferences.saving") : t("saveButton")}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
}
