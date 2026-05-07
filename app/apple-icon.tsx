import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#020617",
          borderRadius: 40,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#22d3ee",
            borderRadius: 9999,
            height: 112,
            width: 112,
          }}
        />
        <div
          style={{
            background: "#020617",
            borderRadius: 9999,
            height: 44,
            position: "absolute",
            width: 44,
          }}
        />
        <div
          style={{
            background: "#67e8f9",
            borderRadius: 9999,
            bottom: 36,
            height: 10,
            position: "absolute",
            width: 92,
          }}
        />
      </div>
    ),
    size,
  );
}
