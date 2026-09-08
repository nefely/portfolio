"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

// Runs before hydration and mirrors the logic below: applies the stored
// preference (or system default) immediately, so there's no flash of the
// wrong theme. Injected via `useServerInsertedHTML` (below) rather than an
// inline `<Script>` element — a raw `<script>` rendered as part of the React
// tree gets recreated (and warned about by React 19) whenever that tree
// re-renders on the client, e.g. on a locale switch. `useServerInsertedHTML`
// writes straight into the HTML stream during SSR and is a documented no-op
// on the client, so it never becomes a client-rendered node in the first place.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var resolved = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.classList.toggle("light", resolved === "light");
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

// --- Stored theme preference, exposed as an external store -----------------
// Modeled as a store (rather than effect + setState) so reading it never
// needs an extra render pass just to sync from localStorage on mount.

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedTheme: Theme | null = null;

function readStoredTheme(): Theme {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return stored === "light" || stored === "dark" ? stored : "system";
	} catch {
		return "system";
	}
}

function getThemeSnapshot(): Theme {
	if (cachedTheme === null) {
		cachedTheme = readStoredTheme();
	}
	return cachedTheme;
}

function getThemeServerSnapshot(): Theme {
	return "system";
}

function subscribeTheme(onChange: Listener) {
	listeners.add(onChange);
	return () => listeners.delete(onChange);
}

function writeStoredTheme(next: Theme) {
	cachedTheme = next;
	try {
		window.localStorage.setItem(STORAGE_KEY, next);
	} catch {}
	listeners.forEach((listener) => listener());
}

// --- OS-level color scheme, also exposed as an external store --------------

function subscribeSystemTheme(onChange: Listener) {
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

function getSystemThemeSnapshot(): ResolvedTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSystemThemeServerSnapshot(): ResolvedTheme {
	return "light";
}

type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	useServerInsertedHTML(() => (
		<script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
	));

	const theme = useSyncExternalStore(
		subscribeTheme,
		getThemeSnapshot,
		getThemeServerSnapshot
	);
	const systemTheme = useSyncExternalStore(
		subscribeSystemTheme,
		getSystemThemeSnapshot,
		getSystemThemeServerSnapshot
	);
	const resolvedTheme = theme === "system" ? systemTheme : theme;

	// Syncing the resolved theme to the DOM is exactly what effects are for:
	// keeping an external system (the `dark` class / color-scheme) in step
	// with React state, with no setState involved.
	useEffect(() => {
		document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
		document.documentElement.classList.toggle("light", resolvedTheme === "light");
		document.documentElement.style.colorScheme = resolvedTheme;
	}, [resolvedTheme]);

	const setTheme = useCallback((next: Theme) => writeStoredTheme(next), []);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
