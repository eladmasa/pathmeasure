import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top, #155e75 0%, #020617 70%, #020617 100%)",
          borderRadius: 112,
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
            height: 280,
            width: 280,
          }}
        />
        <div
          style={{
            background: "#020617",
            borderRadius: 9999,
            height: 112,
            position: "absolute",
            width: 112,
          }}
        />
        <div
          style={{
            background: "#67e8f9",
            borderRadius: 9999,
            bottom: 104,
            height: 22,
            position: "absolute",
            width: 224,
          }}
        />
      </div>
    ),
    size,
  );
}
