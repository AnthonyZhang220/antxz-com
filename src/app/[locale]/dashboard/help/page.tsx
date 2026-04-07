import { Help } from "@/components/dashboard/help";

export default function DashboardHelpPage() {
	return (
		<div className="p-4 lg:p-6">
			<h1 className="text-xl font-semibold">Get Help</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Need assistance? Find support resources and troubleshooting steps.
			</p>
			<Help />
		</div>
	);
}
