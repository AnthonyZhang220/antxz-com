"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Globe, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { UserSettings } from "@/lib/user/preferences";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";
import {
	getUserSettings,
	saveUserSettings,
} from "@/lib/actions/settings-actions";

export default function DashboardSettings() {
	const t = useTranslations("dashboard.settings");
	const tm = useTranslations("toast.dashboard.settings");
	const locale = useLocale();
	const pathname = usePathname();
	const router = useRouter();
	const { setTheme } = useTheme();
	const [settings, setSettings] = useState<UserSettings | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const saveErrorMessage = tm("error");
	const saveSuccessMessage = tm("success");

	useEffect(() => {
		const fetchPreferences = async () => {
			try {
				const result = await getUserSettings();
				if (!result.success) {
					throw new Error(result.error || "Failed to load preferences");
				}

				if (!result.data) {
					throw new Error("No preferences data returned");
				}

				setSettings(result.data);
			} catch (e) {
				console.error("fetchPreferences failed", e);
			} finally {
				setIsLoading(false);
			}
		};
		fetchPreferences();
	}, []);

	const handleSettingChange = (key: keyof UserSettings, value: unknown) => {
		setSettings((prev: UserSettings | null) => {
			if (!prev) return prev;
			return { ...prev, [key]: value };
		});
		setHasChanges(true);
	};

	const handleToggleNotifications = () => {
		setSettings((prev: UserSettings | null) => {
			if (!prev) return prev;
			return { ...prev, notifications_enabled: !prev.notifications_enabled };
		});
		setHasChanges(true);
	};

	const onSave = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!settings) return;
		setIsSaving(true);
		const loadingToastId = startLoading(t("buttons.saving"));

		try {
			const result = await saveUserSettings(settings);

			if (!result.success) {
				finishLoadingError(loadingToastId, result.error || saveErrorMessage);
				return;
			}

			if (settings.theme) {
				setTheme(settings.theme);
			}

			finishLoadingSuccess(loadingToastId, saveSuccessMessage);
			setHasChanges(false);

			if (settings.locale && settings.locale !== locale) {
				window.location.href = `/${settings.locale}${pathname.replace(`/${locale}`, "")}`;
				return;
			}

			router.refresh();
		} catch (error) {
			const message =
				error instanceof Error && error.message
					? error.message
					: saveErrorMessage;
			finishLoadingError(loadingToastId, message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<form onSubmit={onSave} className="space-y-6">
				<Card>
					{/* 语言和地区 */}
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="size-5" />
							{locale === "zh" ? "地区和语言" : "Region & Language"}
						</CardTitle>
						<CardDescription>
							{locale === "zh"
								? "自定义你的地区和首选语言"
								: "Customize your region and preferred language"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="locale">
								{locale === "zh" ? "语言" : "Language"}
							</Label>
							{isLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select
									value={settings?.locale}
									onValueChange={(value) =>
										handleSettingChange("locale", value as "en" | "zh")
									}
									disabled={isSaving}
								>
									<SelectTrigger id="locale" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="en">English</SelectItem>
										<SelectItem value="zh">中文</SelectItem>
									</SelectContent>
								</Select>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="region">
								{locale === "zh" ? "地区" : "Region"}
							</Label>
							{isLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select
									value={settings?.region}
									onValueChange={(value) =>
										handleSettingChange(
											"region",
											value as "cn" | "us" | "global",
										)
									}
									disabled={isSaving}
								>
									<SelectTrigger id="region" className="w-full">
										<SelectValue />
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
							)}
						</div>
					</CardContent>

					{/* 主题 */}
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sun className="size-5" />
							{locale === "zh" ? "主题" : "Theme"}
						</CardTitle>
						<CardDescription>
							{locale === "zh"
								? "选择你偏好的外观主题"
								: "Choose your preferred appearance"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="theme">
								{locale === "zh" ? "主题模式" : "Theme Mode"}
							</Label>
							{isLoading ? (
								<Skeleton className="h-10 w-full" />
							) : (
								<Select
									value={settings?.theme}
									onValueChange={(value) =>
										handleSettingChange(
											"theme",
											value as "light" | "dark" | "system",
										)
									}
									disabled={isSaving}
								>
									<SelectTrigger id="theme" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="light">
											{locale === "zh" ? "浅色" : "Light"}
										</SelectItem>
										<SelectItem value="dark">
											{locale === "zh" ? "深色" : "Dark"}
										</SelectItem>
										<SelectItem value="system">
											{locale === "zh" ? "跟随系统" : "System"}
										</SelectItem>
									</SelectContent>
								</Select>
							)}
						</div>
					</CardContent>

					{/* 通知 */}
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="size-5" />
							{locale === "zh" ? "通知" : "Notifications"}
						</CardTitle>
						<CardDescription>
							{locale === "zh"
								? "管理你的通知偏好"
								: "Manage your notification preferences"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="font-medium">
									{locale === "zh" ? "启用通知" : "Enable Notifications"}
								</p>
								<p className="text-sm text-muted-foreground">
									{locale === "zh"
										? "接收关于评论和更新的通知"
										: "Receive notifications about comments and updates"}
								</p>
							</div>
							{isLoading ? (
								<Skeleton className="size-10 rounded-md" />
							) : (
								<Toggle
									pressed={settings?.notifications_enabled}
									onPressedChange={handleToggleNotifications}
									disabled={isSaving}
									aria-label="Toggle notifications"
									className="size-10"
								>
									{settings?.notifications_enabled ? (
										<Bell className="size-5 fill-current" />
									) : (
										<Bell className="size-5 opacity-50" />
									)}
								</Toggle>
							)}
						</div>
					</CardContent>

					{/* 保存按钮 */}
					<CardFooter className="justify-end">
						<Button
							type="submit"
							disabled={isSaving || isLoading || !hasChanges}
							size="lg"
						>
							{isSaving ? t("buttons.saving") : t("buttons.save")}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
