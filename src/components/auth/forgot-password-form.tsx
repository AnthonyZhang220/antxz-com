"use client";

import { useState } from "react";
import { startLoading, finishLoadingSuccess, finishLoadingError } from "@/lib/errors/error-utils";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const t = useTranslations("auth.forgotPasswordForm");
	const tm = useTranslations("toast.auth.forgotPassword");
	const [email, setEmail] = useState("");
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const locale = useLocale();

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		const toastId = startLoading(tm("loading"));

		try {
			// The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/${locale}/auth/update-password`,
			});
			if (error) throw error;
			setSuccess(true);
			finishLoadingSuccess(toastId, tm("success"));
		} catch (error: unknown) {
			finishLoadingError(toastId, error instanceof Error ? error.message : tm("error"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			{success ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">{t("successPage.title")}</CardTitle>
						<CardDescription>{t("successPage.description")}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							{t("successPage.content")}
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl">{t("title")}</CardTitle>
						<CardDescription>{t("description")}</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleForgotPassword}>
							<div className="flex flex-col gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">{t("emailLabel")}</Label>
									<Input
										id="email"
										type="email"
										placeholder="m@example.com"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>

								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? t("loading") : t("button")}
								</Button>
							</div>
							<div className="mt-4 text-center text-sm">
								{t("haveAccount")}{" "}
								<Link
									href={`/${locale}/auth/login`}
									className="underline underline-offset-4"
								>
									{t("loginLink")}
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
