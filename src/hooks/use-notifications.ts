"use client";

import {
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from "react";
import { useLocale } from "next-intl";

import {
	getNotifications,
	getNotificationById,
	type DashboardNotification,
} from "@/lib/actions/notifications-actions";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

/**
 * Manages notification data fetching, realtime subscription, and focus-based
 * refresh. UI concerns (translations, filtering, mark-read) stay in the component.
 */
export function useNotificationData(
	loadErrorMessage: string,
	onNewNotification?: (notification: DashboardNotification) => void
) {
	const locale = useLocale();

	const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const notificationsRef = useRef<DashboardNotification[]>([]);
	const lastLoadedAtRef = useRef(0);
	const realtimeChannelRef = useRef<ReturnType<
		ReturnType<typeof createSupabaseClient>["channel"]
	> | null>(null);

	const setNotificationState = (
		updater:
			| DashboardNotification[]
			| ((prev: DashboardNotification[]) => DashboardNotification[])
	) => {
		setNotifications((prev) => {
			const next = typeof updater === "function" ? updater(prev) : updater;
			notificationsRef.current = next;
			return next;
		});
	};

	const reload = async (withLoading: boolean) => {
		if (withLoading) setIsLoading(true);
		setLoadError(null);

		const result = await getNotifications(locale);
		if (!result.success) {
			setLoadError(result.error || loadErrorMessage);
			setIsLoading(false);
			return;
		}

		setNotificationState(result.data ?? []);
		lastLoadedAtRef.current = Date.now();
		setIsLoading(false);
	};

	const reloadEffect = useEffectEvent(reload);

	const handleInsertEffect = useEffectEvent(async (rawId: string) => {
		const result = await getNotificationById(rawId, locale);
		if (result.success && result.data) {
			setNotificationState((prev) => [result.data!, ...prev]);
			onNewNotification?.(result.data);
			lastLoadedAtRef.current = Date.now();
		}
	});

	const handleUpdateEffect = useEffectEvent(
		(row: { id: string; is_read: boolean; read_at: string | null }) => {
			setNotificationState((prev) =>
				prev.map((n) =>
					n.id === row.id ? { ...n, is_read: row.is_read, read_at: row.read_at } : n
				)
			);
		}
	);

	const handleDeleteEffect = useEffectEvent((rawId: string) => {
		setNotificationState((prev) => prev.filter((n) => n.id !== rawId));
	});

	useEffect(() => {
		const id = window.setTimeout(() => void reloadEffect(true), 0);
		return () => window.clearTimeout(id);
	}, [locale, loadErrorMessage]);

	useEffect(() => {
		const supabase = createSupabaseClient();
		let isDisposed = false;

		const setupRealtime = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user || isDisposed) return;

			realtimeChannelRef.current = supabase
				.channel(`dashboard-notifications-${user.id}`)
				.on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
					void handleInsertEffect(String((payload.new as Record<string, unknown>).id));
				})
				.on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
					const row = payload.new as Record<string, unknown>;
					handleUpdateEffect({ id: String(row.id), is_read: Boolean(row.is_read), read_at: row.read_at ? String(row.read_at) : null });
				})
				.on("postgres_changes", { event: "DELETE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
					handleDeleteEffect(String((payload.old as Record<string, unknown>).id));
				})
				.subscribe();
		};

		const handleFocus = () => {
			if (Date.now() - lastLoadedAtRef.current > 60_000) {
				void reloadEffect(false);
			}
		};

		window.addEventListener("focus", handleFocus);
		void setupRealtime();

		return () => {
			isDisposed = true;
			window.removeEventListener("focus", handleFocus);
			if (realtimeChannelRef.current) {
				void supabase.removeChannel(realtimeChannelRef.current);
				realtimeChannelRef.current = null;
			}
		};
	}, [locale, loadErrorMessage]);

	return { notifications, isLoading, loadError, reload, setNotificationState };
}

