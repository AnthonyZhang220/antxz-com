import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

export default function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}
