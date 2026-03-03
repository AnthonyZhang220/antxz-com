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
		<header className="fixed top-0 inset-x-0 flex items-center justify-between px-8 py-4 z-50">
			{/* Logo */}
			<Link href="/">
				<span className="font-montserrat tracking-widest text-2xl">
					{h("logo")}
				</span>
			</Link>
			{/* Sheet 触发按钮 */}
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="ghost" size="lg">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="top" className="h-screen w-screen max-w-none p-0">
					{/* 顶部栏 — logo 左，关闭按钮右 */}
					<div className="flex items-center justify-between px-8 py-6">
						<Link href="/">
							<span className="font-montserrat tracking-widest text-2xl">
								{h("logo")}
							</span>
						</Link>
						<SheetClose asChild>
							<Button variant="ghost" size="lg">
								<XIcon className="h-5 w-5" />
							</Button>
						</SheetClose>
					</div>
					{/* 导航链接 — 垂直居中 */}
					<nav className="flex items-center justify-center h-[calc(100vh-72px)]">
						<div className="flex flex-col items-start gap-12">
							{navigationConfig.map(({ key, href }) => (
								<SheetClose asChild key={key}>
									<Link
										href={href}
										className="flex flex-col items-start gap-2 group"
									>
										<span className="text-6xl font-bold group-hover:text-primary transition-colors">
											{t(`${key}.title`)}
										</span>
										<span className="text-xl text-muted-foreground">
											{t(`${key}.subtitle`)}
										</span>
									</Link>
								</SheetClose>
							))}
						</div>
					</nav>
				</SheetContent>
			</Sheet>
		</header>
	);
}
