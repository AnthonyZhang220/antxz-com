"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { navigationConfig } from "@/config/navigation";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
} from "@/components/ui/sheet";
import { Menu, XIcon } from "lucide-react";
import { Button } from "../ui/button";

// 在渲染时，你会根据当前的 [locale] 自动拼接前缀
// 例如：/zh/blog 或 /en/blog
export default function Navbar() {
	const t = useTranslations("navbar");
	const h = useTranslations("home");

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
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="top" className="h-screen w-screen max-w-none p-0 flex flex-col">
					<SheetClose asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-3 top-3 z-20 h-9 w-9 sm:right-5 sm:top-5 sm:h-10 sm:w-10"
						>
							<XIcon className="h-5 w-5" />
						</Button>
					</SheetClose>
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
