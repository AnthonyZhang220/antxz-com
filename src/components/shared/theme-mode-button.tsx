"use client";

import { startTransition } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setCookie } from "@/lib/cookies";
import { saveThemePreference } from "@/lib/actions/user-preferences";

export default function ThemeModeButton() {
	const t = useTranslations("themeMode");
	const { theme, setTheme, systemTheme } = useTheme();

	const handleTheme = (value: string) => {
		setCookie("preferred_theme", value); // 保存一年
		setTheme(value);
		startTransition(() => {
			void saveThemePreference(value);
		});
	};

	// 获取当前显示的图标和文本
	const getDisplayContent = () => {
		if (theme === "system") {
			const icon =
				systemTheme === "light" ? (
					<Sun className="h-4 w-4" />
				) : (
					<Moon className="h-4 w-4" />
				);
			return { icon, text: t("system") };
		}
		if (theme === "light") {
			return { icon: <Sun className="h-4 w-4" />, text: t("light") };
		}
		return { icon: <Moon className="h-4 w-4" />, text: t("dark") };
	};

	const { icon, text } = getDisplayContent();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="default">
					{icon}
					<span>{text}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="min-w-36">
				<DropdownMenuGroup>
					<DropdownMenuRadioGroup
						value={theme || "system"}
						onValueChange={handleTheme}
					>
						<DropdownMenuRadioItem value="light">
							<Sun />
							{t("light")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="dark">
							<Moon />
							{t("dark")}
						</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="system">
							{systemTheme === "light" ? <Sun /> : <Moon />}
							{t("system")}
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
