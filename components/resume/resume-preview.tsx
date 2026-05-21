"use client";

export type CountryStyle = {
  accentColor: string;
  fontFamily: string;
  nameAlign: "center" | "left";
  sectionStyle: "underline" | "left-border" | "minimal" | "filled";
};

export const COUNTRY_STYLES: Record<string, CountryStyle> = {
  US: { accentColor: "#0A66C2", fontFamily: "'Arial', sans-serif",                    nameAlign: "center", sectionStyle: "underline"   },
  CA: { accentColor: "#003087", fontFamily: "'Calibri', 'Arial', sans-serif",         nameAlign: "center", sectionStyle: "underline"   },
  GB: { accentColor: "#1a1a2e", fontFamily: "'Times New Roman', serif",               nameAlign: "left",   sectionStyle: "left-border" },
  AU: { accentColor: "#0d7377", fontFamily: "'Arial', sans-serif",                    nameAlign: "left",   sectionStyle: "underline"   },
  NZ: { accentColor: "#007a5e", fontFamily: "'Arial', sans-serif",                    nameAlign: "left",   sectionStyle: "underline"   },
  FR: { accentColor: "#6c5ce7", fontFamily: "'Garamond', 'Georgia', serif",           nameAlign: "center", sectionStyle: "minimal"     },
  BE: { accentColor: "#5a4db0", fontFamily: "'Garamond', 'Georgia', serif",           nameAlign: "center", sectionStyle: "minimal"     },
  CH: { accentColor: "#2d3436", fontFamily: "'Calibri', 'Trebuchet MS', sans-serif",  nameAlign: "left",   sectionStyle: "filled"      },
  IN: { accentColor: "#c62828", fontFamily: "'Arial', sans-serif",                    nameAlign: "center", sectionStyle: "underline"   },
};

export function ResumePreview({
  text,
  accentColor = "#0A66C2",
  fontFamily = "'Arial', sans-serif",
  nameAlign = "center",
  sectionStyle = "underline",
}: {
  text: string;
  accentColor?: string;
  fontFamily?: string;
  nameAlign?: "center" | "left";
  sectionStyle?: "underline" | "left-border" | "minimal" | "filled";
}) {
  if (!text.trim()) return null;
  const lines = text.split("\n");
  const firstContentLine = lines.find(l => l.trim());

  const getSectionHeaderStyle = (): React.CSSProperties => {
    switch (sectionStyle) {
      case "left-border":
        return { fontSize: "9.5pt", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: accentColor, borderLeft: `3px solid ${accentColor}`, paddingLeft: "8px" };
      case "minimal":
        return { fontSize: "9pt", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: accentColor };
      case "filled":
        return { fontSize: "9pt", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#fff", background: accentColor, padding: "2px 8px" };
      default:
        return { fontSize: "9.5pt", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: accentColor, borderBottom: `1.5px solid ${accentColor}55`, paddingBottom: "2px" };
    }
  };

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
                style={{ fontSize: "22pt", fontWeight: 700, textAlign: nameAlign, color: accentColor, letterSpacing: "-0.02em", marginBottom: "2px" }}
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
              <p key={i} style={{ textAlign: nameAlign, fontSize: "9.5pt", color: "#4b5563", marginBottom: "2px" }}>
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
                <p style={getSectionHeaderStyle()}>{trimmed}</p>
              </div>
            );
          }

          if (trimmed.match(/^[•\-–—*]\s/)) {
            return (
              <div key={i} style={{ display: "flex", gap: "8px", marginLeft: "8px", margin: "2px 0 2px 8px" }}>
                <span style={{ color: accentColor, flexShrink: 0, marginTop: "1px" }}>•</span>
                <p style={{ fontSize: "10.5pt", color: "#374151", flex: 1, textAlign: "justify" } as React.CSSProperties}>
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
            <p key={i} style={{ fontSize: "10.5pt", color: "#374151", margin: "1px 0", textAlign: "justify" } as React.CSSProperties}>
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cover letter preview — paragraph-based for proper justification ────────────

function isCoverLetterHeaderBlock(para: string): boolean {
  const joined = para.replace(/\n/g, " ").trim();
  // Short text (single line-ish) or looks like a header/salutation/closing
  if (joined.length < 90) return true;
  // Salutation lines
  if (/^(dear|madame|monsieur|cordialement|sincerely|regards)/i.test(joined)) return true;
  return false;
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

  // Split into paragraphs on blank lines
  const paragraphs = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div
      className="bg-white shadow-xl rounded-sm mx-auto w-full max-w-[700px] min-h-[900px] overflow-hidden"
      style={{ fontFamily }}
    >
      <div style={{ background: accentColor, height: "5px" }} />
      <div style={{ padding: "44px 52px" }}>
        {paragraphs.map((para, i) => {
          const isHeader = isCoverLetterHeaderBlock(para);
          const lines = para.split("\n");

          if (isHeader) {
            // Multi-line header blocks (name + contact, date, recipient, salutation, closing)
            return (
              <div key={i} style={{ marginBottom: "14pt" }}>
                {lines.map((line, j) => (
                  <p
                    key={j}
                    style={{ fontSize: "11pt", lineHeight: "1.65", color: "#1f2937", margin: 0 }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            );
          }

          // Body paragraph — join internal newlines into one flowing block and justify
          const bodyText = lines.join(" ");
          return (
            <p
              key={i}
              style={{
                fontSize: "11pt",
                lineHeight: "1.75",
                color: "#1f2937",
                marginBottom: "14pt",
                textAlign: "justify",
                hyphens: "auto",
              } as React.CSSProperties}
            >
              {bodyText}
            </p>
          );
        })}
      </div>
      <div style={{ background: accentColor, height: "2px", opacity: 0.25 }} />
    </div>
  );
}
