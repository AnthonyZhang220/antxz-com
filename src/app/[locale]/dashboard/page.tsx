import notFound from "@/app/not-found";
import { Overview } from "@/components/dashboard/overview";
import { getAccountProfile } from "@/lib/actions/account-actions";


export default async function DashboardPage() {
	const profile = await getAccountProfile();

	const initialUser = profile.success && profile.data ? profile.data : null;

	if (!initialUser || !profile.success || !profile.data) {
		notFound();
	} else {
		return <Overview user={initialUser} />;
	}
}
