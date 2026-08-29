import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export default async function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const region = (await headers()).get("x-region") ?? "global";

	return (
		<>
			<Navbar initialUser={user} />
			{children}
			<Footer region={region} />
		</>
	);
}
