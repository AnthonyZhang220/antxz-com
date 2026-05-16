import { LoginForm } from "@/components/auth/login-form";
import { cookies } from "next/headers";

export default async function Page() {
	const cookieStore = await cookies();
	const region = cookieStore.get("preferred_region")?.value ?? "global";
	
	return <LoginForm region={region} />;
}
