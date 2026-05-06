export interface ActionErrorOptions {
	reasons?: string[];
	status?: number;
}

export class ActionError extends Error {
	readonly code: string;
	readonly reasons?: string[];
	readonly status?: number;

	constructor(code: string, message: string, options?: ActionErrorOptions) {
		super(message);
		this.name = "ActionError";
		this.code = code;
		this.reasons = options?.reasons;
		this.status = options?.status;
	}
}

export function createActionError(
	code: string,
	message: string,
	options?: ActionErrorOptions,
): ActionError {
	return new ActionError(code, message, options);
}

export function isActionError(error: unknown): error is ActionError {
	return error instanceof ActionError;
}

export function getActionErrorMessage(error: unknown, fallbackMessage: string): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	if (typeof error === "string" && error) {
		return error;
	}
	return fallbackMessage;
}
