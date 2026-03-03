import { LoginForm } from "@/components/auth/login-form";
import { GalleryVerticalEnd } from "lucide-react";

export default function Page() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-xs">
					<LoginForm />
				</div>
			</div>
			<div className="relative hidden bg-muted lg:block">
				<img
					src="/next.svg"
					alt="Image"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
