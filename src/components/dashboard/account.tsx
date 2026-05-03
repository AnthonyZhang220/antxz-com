"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/error-utils";

import {
	getAccountProfile,
	saveAccountProfile,
	type AccountProfile,
} from "./account-actions";

const emptyForm: AccountProfile = {
	id: "",
	email: "",
	provider: "",
	created_at: null,
	last_sign_in_at: null,
	full_name: "",
	avatar_url: "",
	bio: "",
	website: "",
};

function formatDate(value: string | null) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return date.toLocaleString();
}

export default function DashboardAccount() {
	const t = useTranslations("dashboard.account");
	const loadErrorMessage = t("messages.loadError");
	const [form, setForm] = useState<AccountProfile>(emptyForm);
	const [initialForm, setInitialForm] = useState<AccountProfile>(emptyForm);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const loadAccount = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);
		const result = await getAccountProfile();
		if (!result.success) {
			setLoadError(result.error || loadErrorMessage);
			setIsLoading(false);
			return;
		}

		if (!result.data) {
			setLoadError(loadErrorMessage);
			setIsLoading(false);
			return;
		}

		setForm(result.data);
		setInitialForm(result.data);
		setIsLoading(false);
	}, [loadErrorMessage]);

	useEffect(() => {
		void loadAccount();
	}, [loadAccount]);

	const hasChanges = useMemo(() => {
		return (
			form.full_name !== initialForm.full_name ||
			form.avatar_url !== initialForm.avatar_url ||
			form.bio !== initialForm.bio ||
			form.website !== initialForm.website
		);
	}, [form, initialForm]);

	const initials = useMemo(() => {
		const source = form.full_name || form.email;
		if (!source) {
			return "U";
		}

		const parts = source.trim().split(/\s+/);
		return (parts[0]?.[0] || "U").toUpperCase();
	}, [form.email, form.full_name]);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);
		const loadingToastId = startLoading(t("actions.saving"));

		try {
			const result = await saveAccountProfile({
				full_name: form.full_name,
				avatar_url: form.avatar_url,
				bio: form.bio,
				website: form.website,
			});

			if (!result.success) {
				finishLoadingError(loadingToastId, result.error || t("messages.saveError"));
				return;
			}

			if (!result.data) {
				finishLoadingError(loadingToastId, t("messages.saveError"));
				return;
			}

			setForm(result.data);
			setInitialForm(result.data);
			finishLoadingSuccess(loadingToastId, t("messages.saved"));
		} catch (error) {
			const message =
				error instanceof Error && error.message ? error.message : t("messages.saveError");
			finishLoadingError(loadingToastId, message);
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return <DashboardPageSkeleton rows={4} />;
	}

	if (loadError) {
		return (
			<div className="space-y-6 p-4 lg:p-6">
				<ErrorState
					title={t("title")}
					description={loadError}
					onRetry={() => void loadAccount()}
					retryLabel={t("actions.retry")}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-4 lg:p-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("title")}</CardTitle>
					<CardDescription>{t("description")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center gap-4">
						<Avatar size="lg" className="size-16">
							{form.avatar_url ? (
								<AvatarImage src={form.avatar_url} alt={form.full_name || form.email} />
							) : null}
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<p className="font-medium">{form.full_name || t("fields.noName")}</p>
							<p className="text-sm text-muted-foreground">{form.email}</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">{t("fields.provider")}</p>
							<p className="text-sm font-medium capitalize">{form.provider || "-"}</p>
						</div>
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground">{t("fields.memberSince")}</p>
							<p className="text-sm font-medium">{formatDate(form.created_at)}</p>
						</div>
						<div className="space-y-1 md:col-span-2">
							<p className="text-xs text-muted-foreground">{t("fields.lastSignIn")}</p>
							<p className="text-sm font-medium">{formatDate(form.last_sign_in_at)}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>{t("edit.title")}</CardTitle>
						<CardDescription>{t("edit.description")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="full_name">{t("fields.fullName")}</Label>
							<Input
								id="full_name"
								value={form.full_name}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, full_name: e.target.value }))
								}
								placeholder={t("placeholders.fullName")}
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="avatar_url">{t("fields.avatarUrl")}</Label>
							<Input
								id="avatar_url"
								type="url"
								value={form.avatar_url}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, avatar_url: e.target.value }))
								}
								placeholder="https://example.com/avatar.png"
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="website">{t("fields.website")}</Label>
							<Input
								id="website"
								type="url"
								value={form.website}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, website: e.target.value }))
								}
								placeholder="https://your-site.com"
								disabled={isSaving}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bio">{t("fields.bio")}</Label>
							<textarea
								id="bio"
								value={form.bio}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, bio: e.target.value }))
								}
								placeholder={t("placeholders.bio")}
								disabled={isSaving}
								rows={4}
								className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
							/>
						</div>
					</CardContent>
					<CardFooter className="justify-end">
						<Button type="submit" disabled={isSaving || !hasChanges}>
							{isSaving ? t("actions.saving") : t("actions.save")}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}