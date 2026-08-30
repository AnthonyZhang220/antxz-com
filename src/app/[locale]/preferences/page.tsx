import PreferencesForm from "@/components/preferences/preferences-form";
import { Suspense } from "react";

export default function PreferencesPage() {
	return (
		<Suspense fallback={<div>loading...</div>}>
			<PreferencesForm />;
		</Suspense>
	);
}
