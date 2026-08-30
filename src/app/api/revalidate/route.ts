// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
	_type: string;
	slug?: {
		current: string;
	};
};

export async function POST(req: NextRequest) {
	try {
		const { isValidSignature, body } = await parseBody<WebhookPayload>(
			req,
			process.env.SANITY_REVALIDATE_SECRET,
		);

		if (!isValidSignature) {
			return NextResponse.json(
				{ message: "Invalid signature" },
				{ status: 401 },
			);
		}

		if (!body?._type) {
			return NextResponse.json({ message: "Bad Request" }, { status: 400 });
		}
		
		if (body._type === "aboutMe") {
			revalidateTag("aboutMe", "max");
		}

		// 精确到这一篇文章的缓存
		if (body.slug?.current) {
			revalidateTag(`post:${body.slug.current}`, "max");
		}

		// 顺带让列表页/首页这类聚合页也一起刷新
		revalidateTag("post", "max");

		return NextResponse.json({ revalidated: true, now: Date.now() });
	} catch (err) {
		return NextResponse.json(
			{ message: "Error revalidating" },
			{ status: 500 },
		);
	}
}
