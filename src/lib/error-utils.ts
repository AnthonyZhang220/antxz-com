import { toast } from "sonner";

type ToastId = string | number;
const SUCCESS_TOAST_DURATION = 2000;
const ERROR_TOAST_DURATION = 3500;

/**
 * 统一的错误处理函数
 * 用于在客户端显示错误提示
 */
export function handleError(
	error: unknown,
	defaultMessage?: string,
) {
	const message = defaultMessage
		?? (error instanceof Error ? error.message : "Something went wrong");
	toast.error(message);
}

/**
 * 成功提示
 */
export function handleSuccess(message: string) {
	toast.success(message);
}

export function startLoading(message = "Loading..."): ToastId {
	return toast.loading(message, {
		duration: Number.POSITIVE_INFINITY,
	});
}

export function finishLoadingSuccess(
	id: ToastId,
	message: string,
) {
	toast.success(message, {
		id,
		duration: SUCCESS_TOAST_DURATION,
	});
}

export function finishLoadingError(
	id: ToastId,
	message: string,
) {
	toast.error(message, {
		id,
		duration: ERROR_TOAST_DURATION,
	});
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

export function getResultErrorMessage(
	result: { success: boolean; error?: string },
	fallbackMessage = "Something went wrong",
) {
	if (result.success) {
		return null;
	}

	return result.error || fallbackMessage;
}

export function handleResultError(
	result: { success: boolean; error?: string },
	fallbackMessage = "Something went wrong",
) {
	const message = getResultErrorMessage(result, fallbackMessage);
	if (!message) {
		return false;
	}

	handleError(new Error(message), fallbackMessage);
	return true;
}

