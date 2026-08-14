import { ImageResponse } from "next/og";

// iOS applies its own corner rounding to home-screen icons, so this one is
// a plain square (no border-radius) — a pre-rounded icon would show a
// double-rounded edge once iOS masks it.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1115",
        }}
      >
        <div style={{ fontSize: 108, lineHeight: 1, display: "flex" }}>🇮🇹</div>
      </div>
    ),
    { ...size },
  );
}
