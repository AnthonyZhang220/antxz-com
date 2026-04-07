import { redirect } from "next/navigation";

export default function ProtectedPage() {
	redirect("/en/dashboard");
}
