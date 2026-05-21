export const SUPPORTED_COUNTRIES = {
  US: { name: "United States",   flag: "🇺🇸" },
  CA: { name: "Canada",          flag: "🇨🇦" },
  GB: { name: "United Kingdom",  flag: "🇬🇧" },
  AU: { name: "Australia",       flag: "🇦🇺" },
  NZ: { name: "New Zealand",     flag: "🇳🇿" },
  FR: { name: "France",          flag: "🇫🇷" },
  BE: { name: "Belgium",         flag: "🇧🇪" },
  CH: { name: "Switzerland",     flag: "🇨🇭" },
  DE: { name: "Germany",         flag: "🇩🇪" },
  IN: { name: "India",           flag: "🇮🇳" },
  AE: { name: "UAE",             flag: "🇦🇪" },
  SA: { name: "Saudi Arabia",    flag: "🇸🇦" },
  SG: { name: "Singapore",       flag: "🇸🇬" },
  JP: { name: "Japan",           flag: "🇯🇵" },
  ZA: { name: "South Africa",    flag: "🇿🇦" },
} as const;

export type CountryCode = keyof typeof SUPPORTED_COUNTRIES;
