export type ActionResult<T = void> =
	| { success: true; data?: T }
	| { success: false; error: string; code?: string };

export function isActionFailure<T>(result: ActionResult<T>): result is Extract<ActionResult<T>, { success: false }> {
	return !result.success;
}
