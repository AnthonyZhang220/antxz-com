"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { navigationConfig } from "@/config/navigation";
import { useAuthNavigation, useAuthUser } from "@/hooks";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
	SheetClose,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CircleUserRound,
	LayoutDashboard,
	LogOut,
	Menu,
	User as UserIcon,
	XIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type NavbarProps = {
	initialUser?: User | null;
};

// 在渲染时，你会根据当前的 [locale] 自动拼接前缀
// 例如：/zh/blog 或 /en/blog
export default function Navbar({ initialUser }: NavbarProps) {
	const t = useTranslations("navbar");
	const h = useTranslations("home");
	const a = useTranslations("auth.loginForm");
	const um = useTranslations("navbar.userMenu");
	const { user, displayName, initials, signOut } = useAuthUser(initialUser);
	const { authHref, accountHref, dashboardHref, handleLogout } =
		useAuthNavigation(signOut);
	const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

	const renderUserMenu = (align: "start" | "end" = "end") => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{
					/* 如果用户有头像，显示头像；否则显示默认图标和名字 */
					avatarUrl ? (
						<Avatar className="h-8 w-8 rounded-lg grayscale">
							<AvatarImage src={avatarUrl} alt={displayName} />
							<AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-zinc-800" />
						</Avatar>
					) : (
						<button
							type="button"
							className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-zinc-200 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 sm:h-10 sm:w-10"
							aria-label={um("open")}
						>
							{initials}
						</button>
					)
				}
			</DropdownMenuTrigger>
			<DropdownMenuContent align={align} className="w-44">
				<DropdownMenuLabel className="flex items-center gap-2">
					<CircleUserRound className="h-4 w-4" />
					<span className="truncate">{displayName}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href={accountHref} className="cursor-pointer">
						<UserIcon className="h-4 w-4" />
						{um("account")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href={dashboardHref} className="cursor-pointer">
						<LayoutDashboard className="h-4 w-4" />
						{um("dashboard")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					onClick={handleLogout}
					className="cursor-pointer"
				>
					<LogOut className="h-4 w-4" />
					{um("logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<header className="sticky inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-3 sm:h-16 sm:px-6 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70 border-b border-border/60">
			{/* Logo */}
			<Link href="/">
				<span className="font-montserrat text-xl tracking-widest sm:text-2xl">
					{h("logo")}
				</span>
			</Link>
			{/* Sheet 触发按钮 */}
			<Sheet>
				<div className="absolute right-3 top-2.5 flex items-center gap-1.5 sm:right-6 sm:top-3 sm:gap-2">
					{user ? (
						renderUserMenu("end")
					) : (
						<Button
							variant="outline"
							size="sm"
							className="h-9 px-3 sm:h-10 sm:px-4"
							asChild
						>
							<Link href={authHref}>{a("button")}</Link>
						</Button>
					)}
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 sm:h-10 sm:w-10"
						>
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
				</div>
				<SheetContent
					side="top"
					className="h-screen w-screen max-w-none p-0 flex flex-col"
				>
					<SheetTitle className="sr-only">{t("sheetTitle")}</SheetTitle>
					<SheetDescription className="sr-only">{t("sheetTitle")}</SheetDescription>
					<div className="absolute right-3 top-2.5 z-20 flex items-center gap-1.5 sm:right-6 sm:top-3 sm:gap-2">
						{user ? (
							renderUserMenu("end")
						) : (
							<SheetClose asChild>
								<Button
									variant="outline"
									size="sm"
									className="h-9 px-3 sm:h-10 sm:px-4"
									asChild
								>
									<Link href={authHref}>{a("button")}</Link>
								</Button>
							</SheetClose>
						)}
						<SheetClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 sm:h-10 sm:w-10"
							>
								<XIcon className="h-5 w-5" />
							</Button>
						</SheetClose>
					</div>
					{/* 导航链接 — 以整个视口为基准居中，文字保持左对齐 */}
					<nav className="flex-1 overflow-y-auto">
						<div className="mx-auto flex min-h-full w-full max-w-2xl items-center px-3 sm:px-6">
							<div className="flex w-full flex-col items-start gap-4 sm:gap-7">
								{navigationConfig.map(({ key, href }) => (
									<SheetClose asChild key={key}>
										<Link
											href={href}
											className="group flex w-full flex-col items-start gap-1 text-left"
										>
											<span className="text-[clamp(1.75rem,7vw,3.75rem)] font-bold group-hover:text-primary transition-colors leading-[1.05] wrap-break-word">
												{t(`${key}.title`)}
											</span>
											<span className="text-sm sm:text-base md:text-lg text-muted-foreground">
												{t(`${key}.subtitle`)}
											</span>
										</Link>
									</SheetClose>
								))}
							</div>
						</div>
					</nav>
				</SheetContent>
			</Sheet>
		</header>
	);
}
