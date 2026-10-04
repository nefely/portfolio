import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest (на відміну від Jest) не реєструє cleanup Testing Library сам.
afterEach(() => {
  cleanup();
});
