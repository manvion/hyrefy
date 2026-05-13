export function HyreLogo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hyre-fill" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A66C2" />
          <stop offset="1" stopColor="#004182" />
        </linearGradient>
        <linearGradient id="hyre-shine" x1="18" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.15" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="36" height="36" rx="9" fill="url(#hyre-fill)" />
      {/* Top shine */}
      <rect width="36" height="18" rx="9" fill="url(#hyre-shine)" />

      {/* H left leg — full height */}
      <path d="M10.5 8.5 L10.5 27.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      {/* H right leg — from crossbar down */}
      <path d="M25.5 13 L25.5 27.5" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      {/* Crossbar — diagonal upward = career trajectory */}
      <path d="M10.5 18.5 L25.5 13" stroke="rgba(255,255,255,0.88)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Gold accent dot at apex */}
      <circle cx="25.5" cy="9.5" r="2.5" fill="#F5A623" />
      <circle cx="25.5" cy="9.5" r="1.1" fill="white" />
    </svg>
  );
}
