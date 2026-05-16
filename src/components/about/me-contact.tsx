"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GitHubIcon } from "../shared/github-icon";
import WeChatIcon from "../shared/wechat-icon";
import { ExternalLink, FileUser, Mail, QrCode } from "lucide-react";

export default function MeContact() {
	const tAbout = useTranslations("about.me");
	const wechatId = "Noobita220";
	return (
		<section className="mt-8">
			<div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-background to-muted/30 p-8 sm:p-10">
				{/* Decorative elements */}
				<div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
				<div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />

				<div className="relative z-10">
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						{tAbout("contactTitle")}
					</h2>
					<p className="mt-2 text-base text-muted-foreground max-w-2xl">
						{tAbout("contactDescription")}
					</p>
					<p className="mt-3 inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						{tAbout("contactIntentHint")}
					</p>

					{/* Contact Links Grid */}
					<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
						<Link
							href="mailto:hi@antxz.com"
							className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
						>
							<div className="flex w-full items-start justify-between gap-3">
								<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
									<Mail className="h-3.5 w-3.5" />
									{tAbout("contactActionEmail")}
								</span>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground">
									{tAbout("contactEmail")}
								</p>
								<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
									hi@antxz.com
								</p>
								<p className="text-xs text-muted-foreground">
									{tAbout("contactEmailHint")}
								</p>
							</div>
						</Link>

						<Link
							href="https://github.com/AnthonyZhang220"
							target="_blank"
							rel="noopener noreferrer"
							className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
						>
							<div className="flex w-full items-start justify-between gap-3">
								<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
									<GitHubIcon className="h-5 w-5 text-primary" />
								</div>
								<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
									<ExternalLink className="h-3.5 w-3.5" />
									{tAbout("contactActionExternal")}
								</span>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground">
									{tAbout("contactGithub")}
								</p>
								<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
									@AnthonyZhang220
								</p>
								<p className="text-xs text-muted-foreground">
									{tAbout("contactGithubHint")}
								</p>
							</div>
						</Link>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<button
									type="button"
									className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 text-left transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
								>
									<div className="flex w-full items-start justify-between gap-3">
										<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
											<WeChatIcon className="h-5 w-5 text-primary" />
										</div>
										<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
											<QrCode className="h-3.5 w-3.5" />
											{tAbout("contactActionQr")}
										</span>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-semibold text-muted-foreground">
											{tAbout("contactWechat")}
										</p>
										<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
											{wechatId}
										</p>
										<p className="text-xs text-muted-foreground">
											{tAbout("contactWechatHint")}
										</p>
									</div>
								</button>
							</AlertDialogTrigger>
							<AlertDialogContent size="sm">
								<AlertDialogHeader>
									<AlertDialogTitle>
										{tAbout("wechatDialogTitle")}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{tAbout("wechatDialogDescription")}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<div className="mx-auto w-full max-w-60 space-y-3">
									<Image
										alt="WeChat QR Code"
										width={240}
										height={240}
										src="/qr_code.png"
										className="aspect-square w-full rounded-2xl border border-border bg-white bg-center bg-cover bg-no-repeat p-3 shadow-sm"
									/>
									<div className="rounded-xl border bg-muted/40 px-3 py-2 text-center">
										<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
											{tAbout("contactWechat")}
										</p>
										<p className="mt-1 font-mono text-sm font-medium text-foreground">
											{wechatId}
										</p>
									</div>
									<p className="text-center text-xs text-muted-foreground">
										{tAbout("wechatDialogFootnote")}
									</p>
								</div>
								<div className="flex justify-center">
									<AlertDialogCancel>
										{tAbout("contactDialogClose")}
									</AlertDialogCancel>
								</div>
							</AlertDialogContent>
						</AlertDialog>
						<Link
							href="/about/cv"
							target="_blank"
							rel="noopener noreferrer"
							className="group flex flex-col items-start gap-4 rounded-xl border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
						>
							<div className="flex w-full items-start justify-between gap-3">
								<div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
									<FileUser className="h-5 w-5 text-primary" />
								</div>
								<span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
									<ExternalLink className="h-3.5 w-3.5" />
									{tAbout("contactActionCV")}
								</span>
							</div>
							<div className="space-y-1">
								<p className="text-xs font-semibold text-muted-foreground">
									{tAbout("contactCV")}
								</p>
								<p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
									CV
								</p>
								<p className="text-xs text-muted-foreground">
									{tAbout("contactCVHint")}
								</p>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
