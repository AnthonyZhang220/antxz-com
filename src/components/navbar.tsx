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
import { Button } from "./ui/button";

// 在渲染时，你会根据当前的 [locale] 自动拼接前缀
// 例如：/zh/blog 或 /en/blog
export default function Navbar() {
	const t = useTranslations("navbar");
	const h = useTranslations("home");

	return (
		<>
			<Link href="/" className="absolute top-8 left-8">
				<span className="font-montserrat tracking-widest text-2xl">
					{h("logo")}
				</span>
			</Link>
			<Sheet>
				<SheetContent side="top" className="h-screen w-screen max-w-none p-0">
					{/* 关闭按钮，固定在右上角和 trigger 同位置 */}
					<SheetClose asChild className="absolute top-8 right-8">
						<Button variant="ghost" size="lg">
							<XIcon />
						</Button>
					</SheetClose>
					<nav className="flex items-center justify-center h-full">
						<div className="flex flex-col items-start justify-center gap-12">
							{navigationConfig.map(({ key, href }) => (
								<Link
									href={href}
									key={key}
									className="flex flex-col items-start gap-2"
								>
									<span className="text-6xl font-bold hover:text-primary">
										{t(`${key}.title`)}
									</span>
									<span className="text-xl text-muted-foreground">
										{t(`${key}.subtitle`)}
									</span>
								</Link>
							))}
						</div>
					</nav>
				</SheetContent>
				<SheetTrigger asChild className="absolute top-8 right-8">
					<Button variant="ghost" size="lg">
						<Menu />
					</Button>
				</SheetTrigger>
			</Sheet>
		</>
	);
}
