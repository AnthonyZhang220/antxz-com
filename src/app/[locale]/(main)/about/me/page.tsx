import type { Metadata } from "next";
import type { Person, WithContext } from "schema-dts";
import Me from "@/components/about/me";
import { aboutMeQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import BlogComments from "@/components/blog/blog-comments";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { getCommentsByArticleKey } from "@/lib/actions/comments";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/shared/json-ld";

interface AboutPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: AboutPageProps): Promise<Metadata> {
	const { locale } = await params;
	const canonicalUrl = `https://antxz.com/${locale}/about/me`;
	return {
		title: locale === "zh" ? "关于我" : "About Me",
		description:
			locale === "zh"
				? "关于我——开发者、创作者"
				: "About me — developer and creator",
		alternates: {
			canonical: canonicalUrl,
			languages: {
				en: "https://antxz.com/en/about/me",
				zh: "https://antxz.com/zh/about/me",
			},
		},
		openGraph: {
			url: canonicalUrl,
			siteName: "ANTXZ",
			locale: locale === "zh" ? "zh_CN" : "en_US",
		},
	};
}

export default async function AboutPage({ params }: AboutPageProps) {
	const { locale } = await params;

	const doc = await client.fetch(aboutMeQuery);
	if (!doc) notFound();

	const supabase = await createSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const commentResult = await getCommentsByArticleKey(
		"about:me",
		user?.id ?? null,
	);
	const comments = commentResult.success ? commentResult.data : [];

	const jsonLd: WithContext<Person> = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: "Anthony Zhang",
		url: "https://antxz.com",
		sameAs: [
			"https://github.com/AnthonyZhang220",
		],
		jobTitle: locale === "zh" ? "全栈开发者" : "Full-stack Developer",
		description:
			locale === "zh"
				? "关于我——开发者、创作者"
				: "About me — developer and creator",
		image: doc.profileImage?.url,
	};

	return (
		<>
			<JsonLd jsonLd={jsonLd} />
			<Me locale={locale} doc={doc} />
			<section className="relative mx-auto w-full max-w-6xl overflow-x-clip px-5 sm:px-8 lg:px-10">
				<Separator className="my-10" />
				<BlogComments
					initialUser={user}
					articleKey="about:me"
					initialComments={comments}
				/>
			</section>
		</>
	);
}
