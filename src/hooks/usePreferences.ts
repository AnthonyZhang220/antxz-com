"use client";

import { useContext } from "react";
import { PreferencesContext } from "@/lib/providers/preference-provider";
import { toast } from "sonner";

export function usePreferences() {
	const context = useContext(PreferencesContext);

	if (!context) {
		toast.error("Preferences context is not available.");
		throw new Error("Preferences context is not available.");
	}

	return context;
}
