import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function HearMeCard() {
	const t = useTranslations("hearme");
	const options = t.raw("options");
	const optionsKeys = Object.keys(options);

	return (
		<Card className="mx-auto w-full max-w-sm bg-stone-950 text-white">
			<CardHeader>
				<CardTitle className="text-xl font-bold tracking-tight">
					{t("title")}
				</CardTitle>
				<CardDescription className="text-stone-400 line-clamp-1">
					{t("description")}
				</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-wrap gap-2">
				{optionsKeys.map((key) => (
					<label
						key={key}
						htmlFor={key}
						className={cn(
							"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
							"text-sm font-medium transition-all duration-100 cursor-pointer select-none",
							"border-stone-800 bg-stone-900/50 text-white hover:bg-stone-800",
							"has-data-[state=checked]:bg-primary/30",
							"has-data-[state=checked]:text-primary",
							"has-data-[state=checked]:border-primary/30",
						)}
					>
						<Checkbox
							id={key}
							className={cn(
								"size-3.5 rounded-full border-0 transition-none",
								"data-[state=unchecked]:hidden", // 未选中时隐藏
								"data-[state=checked]:bg-transparent", // 选中时透明背景
								"data-[state=checked]:text-stone-950",
								"fill-current",
							)}
						/>
						<span>{t(`options.${key}`)}</span>
					</label>
				))}
			</CardContent>
			<Separator />
			<div className="px-6">
				<Button className="w-full cursor-pointer bg-stone-100 text-stone-950 hover:bg-primary/90 rounded-full">
					{t("submitButton")}
				</Button>
			</div>
		</Card>
	);
}
