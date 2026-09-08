"use client";

import { useSyncExternalStore } from "react";

// Whether client JS has hydrated. Modeled as an external store (rather than
// an effect + setState) so reading it never needs an extra render pass.
function subscribe() {
	return () => {};
}

export function useMounted() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false
	);
}
