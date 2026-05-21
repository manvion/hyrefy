import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hyrefy – AI Resume Builder & Job Application Suite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #12121f 50%, #0d1117 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
            marginBottom: "28px",
            boxShadow: "0 0 60px rgba(99,102,241,0.5)",
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "-2px",
            marginBottom: "16px",
          }}
        >
          Hyrefy
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "rgba(255,255,255,0.65)",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: "1.4",
            marginBottom: "40px",
            fontWeight: "400",
          }}
        >
          AI-Powered Resume Builder & Job Application Suite
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          {["Resume Tailoring", "ATS Analyzer", "Interview AI", "Cover Letters", "9 Countries"].map((feat) => (
            <div
              key={feat}
              style={{
                padding: "8px 18px",
                borderRadius: "100px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              {feat}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "16px",
          }}
        >
          hyrefy.com
        </div>
      </div>
    ),
    { ...size }
  );
}
