export type ActionResult<T = void> =
	| (T extends void ? { success: true } : { success: true; data: T })
	| { success: false; code: string; error: string; status?: number };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T> | ActionResult<void> {
	return data !== undefined
		? ({ success: true, data } as ActionResult<T>)
		: ({ success: true } as ActionResult<void>);
}

export function err(
	code: string,
	error: string,
	status?: number,
): ActionResult<never> {
	return { success: false, code, error, status };
}
