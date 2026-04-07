import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

export default function Page() {
	const t = useTranslations("auth.signupSuccess");

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">{t("title")}</CardTitle>
					<CardDescription>{t("subtitle")}</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
				</CardContent>
			</Card>
		</div>
	);
}
