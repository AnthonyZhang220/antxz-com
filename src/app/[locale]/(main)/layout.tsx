import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<>
			<Navbar initialUser={user} />
			{children}
			<Footer />
		</>
	);
}
