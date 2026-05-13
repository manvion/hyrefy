import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180, height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #0A66C2 0%, #004182 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 90,
          background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
        }} />
        <svg width="90" height="90" viewBox="0 0 20 20" fill="none">
          <line x1="4" y1="2" x2="4" y2="18" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="16" y1="7" x2="16" y2="18" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="4" y1="11" x2="16" y2="7" stroke="rgba(255,255,255,0.88)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div style={{
          position: "absolute", top: 22, right: 28,
          width: 20, height: 20, borderRadius: "50%", background: "#F5A623",
        }} />
      </div>
    ),
    { ...size }
  );
}
