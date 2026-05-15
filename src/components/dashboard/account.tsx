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
import { ErrorState } from "@/components/shared/error-state";
import {
	finishLoadingError,
	finishLoadingSuccess,
	startLoading,
} from "@/lib/errors/error-utils";

import {
	getAccountProfile,
	saveAccountProfile,
	type AccountProfile,
} from "@/lib/actions/account-actions";
import { Spinner } from "../ui/spinner";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../ui/input-group";
import { Textarea } from "../ui/textarea";

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

export default function DashboardAccount() {
	const t = useTranslations("dashboard.account");
	const tm = useTranslations("toast.dashboard.account");
	const loadErrorMessage = tm("loadError");
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
				finishLoadingError(loadingToastId, result.error || tm("saveError"));
				return;
			}

			if (!result.data) {
				finishLoadingError(loadingToastId, tm("saveError"));
				return;
			}

			setForm(result.data);
			setInitialForm(result.data);
			finishLoadingSuccess(loadingToastId, tm("saved"));
		} catch (error) {
			const message =
				error instanceof Error && error.message
					? error.message
					: tm("saveError");
			finishLoadingError(loadingToastId, message);
		} finally {
			setIsSaving(false);
		}
	};

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
			<form onSubmit={onSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>{t("edit.title")}</CardTitle>
						<CardDescription>{t("edit.description")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="full_name">{t("fields.fullName")}</Label>
							<InputGroup>
								<InputGroupInput
									id="full_name"
									value={form.full_name}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, full_name: e.target.value }))
									}
									placeholder={t("placeholders.fullName")}
									disabled={isSaving || isLoading}
								/>
								<InputGroupAddon align="inline-end">
									{isLoading && <Spinner className="animate-spin" />}
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="avatar_url">{t("fields.avatarUrl")}</Label>
							<InputGroup>
								<InputGroupInput
									id="avatar_url"
									type="url"
									value={isLoading ? "" : form.avatar_url}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, avatar_url: e.target.value }))
									}
									placeholder="https://example.com/avatar.png"
									disabled={isSaving || isLoading}
								/>
								<InputGroupAddon align="inline-end">
									{isLoading && <Spinner className="animate-spin" />}
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="website">{t("fields.website")}</Label>
							<InputGroup>
								<InputGroupInput
									id="website"
									type="url"
									value={isLoading ? "" : form.website}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, website: e.target.value }))
									}
									placeholder="https://your-site.com"
									disabled={isSaving || isLoading}
								/>
								<InputGroupAddon align="inline-end">
									{isLoading && <Spinner className="animate-spin" />}
								</InputGroupAddon>
							</InputGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="bio">{t("fields.bio")}</Label>
							<Textarea
								id="bio"
								value={isLoading ? "" : form.bio}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, bio: e.target.value }))
								}
								placeholder={t("placeholders.bio")}
								disabled={isSaving || isLoading}
								rows={4}
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
