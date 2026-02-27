import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // 你自写的工具类

export async function POST(request: Request) {
	const answers = await request.json();
	// 1. 这里写你的 MBTI 算法
	const result = calculateMBTI(answers);

	// 2. 调用 Supabase 存储
	// ...

	return NextResponse.json({ type: result });
}
