/**
 * DEPRECATED
 *
 * This route has been replaced by Server Actions.
 * Use actions in src/lib/actions/comments.ts:
 * - getCommentModerationQueue
 * - setCommentModerationStatus
 * - deleteCommentAsAdmin
 * - blockCommentUser
 *
 * Intentionally no route handlers are exported.
 */
import { NextResponse } from "next/server";

/**
 * @deprecated
 * This route has been replaced by Server Actions in src/lib/actions/blog.ts
 */
export async function GET() {
	return NextResponse.json(
		{ message: "This endpoint is deprecated. Use Server Actions instead." },
		{ status: 410 }, // 410 Gone 表示资源已永久失效
	);
}

// 如果你之前用的是 POST，也可以导出一个 POST
export async function POST() {
	return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}
