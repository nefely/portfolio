import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS не підтримує SVG-іконки на домашньому екрані — генеруємо PNG з того ж
// дизайну, що й app/icon.svg (на білді, один раз).
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0479b, #3fc1e0)",
      }}
    >
      <svg width="120" height="120" viewBox="0 0 64 64">
        <path
          d="M43 21.5A15 15 0 1 0 47 32H33"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}
