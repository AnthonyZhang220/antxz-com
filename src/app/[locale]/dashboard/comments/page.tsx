import CommentModeration from "@/components/dashboard/comment-moderation";
import UserComments from "@/components/dashboard/user-comments";

export default function DashboardCommentsPage() {
	return (
		<div className="space-y-6 p-4 lg:p-6">
			<UserComments />
			<CommentModeration />
		</div>
	);
}
