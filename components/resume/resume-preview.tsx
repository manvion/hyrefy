"use client";

export const COUNTRY_STYLES: Record<string, { accentColor: string; fontFamily: string }> = {
  US: { accentColor: "#0A66C2", fontFamily: "'Arial', sans-serif" },
  CA: { accentColor: "#0A66C2", fontFamily: "'Arial', sans-serif" },
  GB: { accentColor: "#1a1a2e", fontFamily: "'Times New Roman', serif" },
  AU: { accentColor: "#0d7377", fontFamily: "'Arial', sans-serif" },
  NZ: { accentColor: "#0d7377", fontFamily: "'Arial', sans-serif" },
  FR: { accentColor: "#6c5ce7", fontFamily: "'Garamond', 'Georgia', serif" },
  BE: { accentColor: "#6c5ce7", fontFamily: "'Garamond', 'Georgia', serif" },
  CH: { accentColor: "#2d3436", fontFamily: "'Calibri', 'Trebuchet MS', sans-serif" },
  IN: { accentColor: "#d63031", fontFamily: "'Arial', sans-serif" },
};

export function ResumePreview({
  text,
  accentColor = "#0A66C2",
  fontFamily = "'Arial', sans-serif",
}: {
  text: string;
  accentColor?: string;
  fontFamily?: string;
}) {
  if (!text.trim()) return null;
  const lines = text.split("\n");
  const firstContentLine = lines.find(l => l.trim());

  return (
    <div
      className="bg-white text-gray-900 shadow-xl rounded-sm mx-auto w-full max-w-[700px] min-h-[900px]"
      style={{ fontFamily, fontSize: "11pt", lineHeight: "1.55" }}
    >
      <div style={{ padding: "40px 48px" }}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} style={{ height: "6px" }} />;

          if (line === firstContentLine) {
            return (
              <h1
                key={i}
                style={{ fontSize: "22pt", fontWeight: 700, textAlign: "center", color: accentColor, letterSpacing: "-0.02em", marginBottom: "2px" }}
              >
                {trimmed}
              </h1>
            );
          }

          if (
            i < 10 &&
            (trimmed.includes("|") || trimmed.includes("@") || trimmed.match(/\+\d/) || trimmed.match(/linkedin/i))
          ) {
            return (
              <p key={i} style={{ textAlign: "center", fontSize: "9.5pt", color: "#4b5563", marginBottom: "2px" }}>
                {trimmed}
              </p>
            );
          }

          if (
            trimmed === trimmed.toUpperCase() &&
            trimmed.length > 2 &&
            trimmed.length < 60 &&
            !trimmed.match(/^[•\-–—*]/)
          ) {
            return (
              <div key={i} style={{ marginTop: "18px", marginBottom: "6px" }}>
                <p style={{
                  fontSize: "9.5pt", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: accentColor, borderBottom: `1.5px solid ${accentColor}55`, paddingBottom: "2px"
                }}>
                  {trimmed}
                </p>
              </div>
            );
          }

          if (trimmed.match(/^[•\-–—*]\s/)) {
            return (
              <div key={i} style={{ display: "flex", gap: "8px", marginLeft: "8px", margin: "1px 0 1px 8px" }}>
                <span style={{ color: accentColor, flexShrink: 0, marginTop: "1px" }}>•</span>
                <p style={{ fontSize: "10.5pt", color: "#374151" }}>
                  {trimmed.replace(/^[•\-–—*]\s/, "")}
                </p>
              </div>
            );
          }

          if (trimmed.match(/[—–]|\d{4}/) && trimmed.match(/[A-Z]/) && !trimmed.startsWith("•")) {
            return (
              <p key={i} style={{ fontSize: "11pt", fontWeight: 600, color: "#111827", marginTop: "10px" }}>
                {trimmed}
              </p>
            );
          }

          return (
            <p key={i} style={{ fontSize: "10.5pt", color: "#374151", margin: "1px 0" }}>
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function CoverLetterPreview({
  text,
  accentColor = "#0A66C2",
  fontFamily = "'Georgia', serif",
}: {
  text: string;
  accentColor?: string;
  fontFamily?: string;
}) {
  if (!text.trim()) return null;
  return (
    <div
      className="bg-white shadow-xl rounded-sm mx-auto w-full max-w-[700px] min-h-[900px] overflow-hidden"
      style={{ fontFamily }}
    >
      <div style={{ background: accentColor, height: "5px" }} />
      <div style={{ padding: "44px 52px" }}>
        <pre
          style={{
            whiteSpace: "pre-wrap", fontFamily, fontSize: "11pt",
            lineHeight: "1.75", color: "#1f2937",
          }}
        >
          {text}
        </pre>
      </div>
      <div style={{ background: accentColor, height: "2px", opacity: 0.25 }} />
    </div>
  );
}
