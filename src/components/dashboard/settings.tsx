"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Bell, Globe, Sun } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { handleError, handleSuccess } from "@/lib/error-utils";
import {
	getUserSettings,
	saveUserSettings,
	type UserSettings,
} from "./actions";

export default function DashboardSettings() {
	const locale = useLocale();

	const [settings, setSettings] = useState<Partial<UserSettings>>({
		locale: "en",
		region: "global",
		theme: "system",
		notifications_enabled: true,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		const loadSettings = async () => {
			const result = await getUserSettings();
			if (result.success) {
				setSettings(result.data as UserSettings);
			}
			setIsLoading(false);
		};

		loadSettings();
	}, []);

	const handleSettingChange = (key: keyof UserSettings, value: unknown) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		setHasChanges(true);
	};

	const handleToggleNotifications = () => {
		setSettings((prev) => ({
			...prev,
			notifications_enabled: !prev.notifications_enabled,
		}));
		setHasChanges(true);
	};

	const onSave = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			const result = await saveUserSettings(settings);

			if (!result.success) {
				handleError(new Error(result.error || "Failed to save"));
				return;
			}

			handleSuccess("Settings saved successfully!");
			setHasChanges(false);
		} catch (error) {
			handleError(error);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="p-4 lg:p-6">
				<div className="h-96 animate-pulse rounded-lg bg-muted" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<form onSubmit={onSave} className="space-y-6">
				{/* 语言和地区 */}
				<Card>
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
							<Select
								value={settings.locale}
								onValueChange={(value) =>
									handleSettingChange(
										"locale",
										value as "en" | "zh"
									)
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
						</div>

						<div className="space-y-2">
							<Label htmlFor="region">
								{locale === "zh" ? "地区" : "Region"}
							</Label>
							<Select
								value={settings.region}
								onValueChange={(value) =>
									handleSettingChange(
										"region",
										value as "cn" | "us" | "global"
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
											<SelectItem value="cn">
												中国
											</SelectItem>
											<SelectItem value="us">
												美国
											</SelectItem>
											<SelectItem value="global">
												全球
											</SelectItem>
										</>
									) : (
										<>
											<SelectItem value="cn">
												China
											</SelectItem>
											<SelectItem value="us">
												United States
											</SelectItem>
											<SelectItem value="global">
												Global
											</SelectItem>
										</>
									)}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<Separator />

				{/* 主题设置 */}
				<Card>
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
							<Select
								value={settings.theme}
								onValueChange={(value) =>
									handleSettingChange(
										"theme",
										value as "light" | "dark" | "system"
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
						</div>
					</CardContent>
				</Card>

				<Separator />

				{/* 通知设置 */}
				<Card>
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
									{locale === "zh"
										? "启用通知"
										: "Enable Notifications"}
								</p>
								<p className="text-sm text-muted-foreground">
									{locale === "zh"
										? "接收关于评论和更新的通知"
										: "Receive notifications about comments and updates"}
								</p>
							</div>
							<Toggle
								pressed={settings.notifications_enabled}
								onPressedChange={handleToggleNotifications}
								disabled={isSaving}
								aria-label="Toggle notifications"
								className="size-10"
							>
								{settings.notifications_enabled ? (
									<Bell className="size-5 fill-current" />
								) : (
									<Bell className="size-5 opacity-50" />
								)}
							</Toggle>
						</div>
					</CardContent>
				</Card>

				<Separator />

				{/* 保存按钮 */}
				<CardFooter className="justify-end">
					<Button
						type="submit"
						disabled={isSaving || !hasChanges}
						size="lg"
					>
						{isSaving
							? locale === "zh"
								? "保存中..."
								: "Saving..."
							: locale === "zh"
								? "保存设置"
								: "Save Settings"}
					</Button>
				</CardFooter>
			</form>
		</div>
	);
}
