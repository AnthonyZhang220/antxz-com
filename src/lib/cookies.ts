export function setCookie(name: string, value: string, days = 365) {
	const maxAge = days * 24 * 60 * 60;
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

export function getCookie(name: string): string | null {
	if (typeof window === "undefined") return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return decodeURIComponent(parts.pop()?.split(";").shift() ?? "");
	}
	return null;
}

export function deleteCookie(name: string) {
	document.cookie = `${name}=; path=/; max-age=0`;
}
