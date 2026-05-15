import CommentModeration from "@/components/dashboard/comment-moderation";
import UserComments from "@/components/dashboard/user-comments";

export default function DashboardCommentsPage() {
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-6  p-4 lg:p-6">
			<UserComments />
			<CommentModeration />
		</div>
	);
}
