"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { startLoading, finishLoadingSuccess, finishLoadingError } from "@/lib/errors/error-utils";

import { cn } from "@/lib/shared/utils";
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

export function UpdatePasswordForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const t = useTranslations("auth.updatePasswordForm");
	const tm = useTranslations("toast.auth.updatePassword");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const locale = useLocale();

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		const toastId = startLoading(tm("loading"));

		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			finishLoadingSuccess(toastId, tm("success"));
			router.push(`/${locale}/dashboard`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "";
			const isSamePassword = message.toLowerCase().includes("should be different") || message.toLowerCase().includes("same as");
			finishLoadingError(toastId, isSamePassword ? tm("samePasswordError") : (message || tm("error")));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">{t("title")}</CardTitle>
					<CardDescription>
						{t("description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleForgotPassword}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="password">{t("newPasswordLabel")}</Label>
								<Input
									id="password"
									type="password"
									placeholder={t("newPasswordPlaceholder")}
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? t("loading") : t("button")}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
