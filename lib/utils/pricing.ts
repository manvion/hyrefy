export interface CountryPrice {
  amount: number;      // Stripe unit_amount (cents / smallest unit)
  currency: string;   // ISO 4217 lowercase
  symbol: string;
  displayAmount: string;
  label: string;
}

export const COUNTRY_PRICING: Record<string, CountryPrice> = {
  US: { amount: 1900, currency: "usd", symbol: "$",  displayAmount: "$19",      label: "USD" },
  CA: { amount: 2500, currency: "cad", symbol: "$",  displayAmount: "CA$25",    label: "CAD" },
  GB: { amount: 1500, currency: "gbp", symbol: "£",  displayAmount: "£15",      label: "GBP" },
  AU: { amount: 2900, currency: "aud", symbol: "$",  displayAmount: "A$29",     label: "AUD" },
  NZ: { amount: 2900, currency: "nzd", symbol: "$",  displayAmount: "NZ$29",    label: "NZD" },
  IN: { amount: 149900, currency: "inr", symbol: "₹", displayAmount: "₹1,499", label: "INR" },
  FR: { amount: 1800, currency: "eur", symbol: "€",  displayAmount: "€18",      label: "EUR" },
  BE: { amount: 1800, currency: "eur", symbol: "€",  displayAmount: "€18",      label: "EUR" },
  CH: { amount: 1900, currency: "chf", symbol: "Fr", displayAmount: "CHF 19",   label: "CHF" },
};

export const DEFAULT_PRICING = COUNTRY_PRICING.US;

export function getPricing(countryCode: string): CountryPrice {
  return COUNTRY_PRICING[countryCode?.toUpperCase()] ?? DEFAULT_PRICING;
}
