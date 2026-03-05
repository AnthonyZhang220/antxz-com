import { toast } from "sonner";

/**
 * 统一的错误处理函数
 * 用于在客户端显示错误提示
 */
export function handleError(
	error: unknown,
	defaultMessage = "Something went wrong",
) {
	const message = error instanceof Error ? error.message : defaultMessage;
	toast.error(message);
}

/**
 * 成功提示
 */
export function handleSuccess(message: string) {
	toast.success(message);
}

/**
 * 将 Server Action 的错误转换为可读的消息
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unexpected error occurred";
}
