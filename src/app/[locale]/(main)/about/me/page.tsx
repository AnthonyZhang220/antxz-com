import Me from "@/components/about/me";
import { aboutMeQuery } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import BlogComments from "@/components/blog/blog-comments";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { getCommentsByArticleKey } from "@/lib/actions/comments";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";

type MePageProps = {
	params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: MePageProps) {
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

	return (
		<>
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
