import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
	const t = await getTranslations("notFound");

	return (
		<section className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black">
			<div className="max-w-3xl w-full px-6 text-center">
				<h2 className="text-3xl font-semibold text-black dark:text-white">
					{t("message")}
				</h2>

				<Link
					href="/"
					className="mt-6 inline-block text-lg text-zinc-700 dark:text-zinc-300 hover:underline"
				>
					{t("homeLink")}
				</Link>
			</div>
		</section>
	);
}
