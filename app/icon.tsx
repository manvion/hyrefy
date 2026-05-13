import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 16,
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
        }} />
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <line x1="4" y1="2" x2="4" y2="18" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="16" y1="7" x2="16" y2="18" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="4" y1="11" x2="16" y2="7" stroke="rgba(255,255,255,0.88)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div style={{
          position: "absolute", top: 4, right: 5,
          width: 5, height: 5, borderRadius: "50%", background: "#F5A623",
        }} />
      </div>
    ),
    { ...size }
  );
}
