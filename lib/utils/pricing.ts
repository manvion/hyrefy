export interface CountryPrice {
  /** Monthly Stripe unit_amount in smallest currency unit (cents, paise, etc.) */
  amount: number;
  /** Yearly Stripe unit_amount — exactly 6 × monthly (50% savings vs 12 months) */
  yearlyAmount: number;
  currency: string;
  symbol: string;
  displayAmount: string;
  displayYearlyPerMonth: string;  // "9.50" for US (shown as "/mo when billed yearly")
  displayYearlyTotal: string;     // "$114" for US (shown as billed annually)
  label: string;
}

export const COUNTRY_PRICING: Record<string, CountryPrice> = {
  US: { amount: 1900, yearlyAmount: 11400, currency: "usd", symbol: "$",  displayAmount: "$19",      displayYearlyPerMonth: "9.50",  displayYearlyTotal: "$114",    label: "USD" },
  CA: { amount: 2500, yearlyAmount: 15000, currency: "cad", symbol: "$",  displayAmount: "CA$25",    displayYearlyPerMonth: "12.50", displayYearlyTotal: "CA$150",  label: "CAD" },
  GB: { amount: 1500, yearlyAmount:  9000, currency: "gbp", symbol: "£",  displayAmount: "£15",      displayYearlyPerMonth: "7.50",  displayYearlyTotal: "£90",     label: "GBP" },
  AU: { amount: 2800, yearlyAmount: 16800, currency: "aud", symbol: "$",  displayAmount: "A$28",     displayYearlyPerMonth: "14.00", displayYearlyTotal: "A$168",   label: "AUD" },
  NZ: { amount: 2900, yearlyAmount: 17400, currency: "nzd", symbol: "$",  displayAmount: "NZ$29",    displayYearlyPerMonth: "14.50", displayYearlyTotal: "NZ$174",  label: "NZD" },
  IN: { amount: 99900, yearlyAmount: 599400, currency: "inr", symbol: "₹", displayAmount: "₹999",  displayYearlyPerMonth: "499.50",displayYearlyTotal: "₹5,994",  label: "INR" },
  FR: { amount: 1800, yearlyAmount: 10800, currency: "eur", symbol: "€",  displayAmount: "€18",      displayYearlyPerMonth: "9.00",  displayYearlyTotal: "€108",    label: "EUR" },
  BE: { amount: 1800, yearlyAmount: 10800, currency: "eur", symbol: "€",  displayAmount: "€18",      displayYearlyPerMonth: "9.00",  displayYearlyTotal: "€108",    label: "EUR" },
  CH: { amount: 1900, yearlyAmount: 11400, currency: "chf", symbol: "Fr", displayAmount: "CHF 19",   displayYearlyPerMonth: "9.50",  displayYearlyTotal: "CHF 114", label: "CHF" },
};

export const DEFAULT_PRICING = COUNTRY_PRICING.US;

export function getPricing(countryCode: string): CountryPrice {
  return COUNTRY_PRICING[countryCode?.toUpperCase()] ?? DEFAULT_PRICING;
}
