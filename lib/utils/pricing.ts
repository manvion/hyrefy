export interface CountryPrice {
  /** Monthly Stripe unit_amount in smallest currency unit (cents, paise, etc.) */
  amount: number;
  /** Yearly Stripe unit_amount — exactly 6 × monthly (50% savings vs 12 months) */
  yearlyAmount: number;
  currency: string;
  symbol: string;
  displayAmount: string;
  displayYearlyPerMonth: string;  // per-month equivalent when billed yearly
  displayYearlyTotal: string;     // total billed annually
  /** First-month discounted amount (half of monthly, whole number) */
  displayFirstMonth: string;
  label: string;
}

export const COUNTRY_PRICING: Record<string, CountryPrice> = {
  US: { amount: 2000, yearlyAmount: 12000, currency: "usd", symbol: "$",   displayAmount: "$20",      displayFirstMonth: "$10",  displayYearlyPerMonth: "10",  displayYearlyTotal: "$120",    label: "USD" },
  CA: { amount: 2600, yearlyAmount: 15600, currency: "cad", symbol: "CA$", displayAmount: "CA$26",    displayFirstMonth: "CA$13",displayYearlyPerMonth: "13",  displayYearlyTotal: "CA$156",  label: "CAD" },
  GB: { amount: 1600, yearlyAmount:  9600, currency: "gbp", symbol: "£",   displayAmount: "£16",      displayFirstMonth: "£8",   displayYearlyPerMonth: "8",   displayYearlyTotal: "£96",     label: "GBP" },
  AU: { amount: 2800, yearlyAmount: 16800, currency: "aud", symbol: "A$",  displayAmount: "A$28",     displayFirstMonth: "A$14", displayYearlyPerMonth: "14",  displayYearlyTotal: "A$168",   label: "AUD" },
  NZ: { amount: 3000, yearlyAmount: 18000, currency: "nzd", symbol: "NZ$", displayAmount: "NZ$30",    displayFirstMonth: "NZ$15",displayYearlyPerMonth: "15",  displayYearlyTotal: "NZ$180",  label: "NZD" },
  IN: { amount: 100000, yearlyAmount: 600000, currency: "inr", symbol: "₹", displayAmount: "₹1,000",  displayFirstMonth: "₹500", displayYearlyPerMonth: "500", displayYearlyTotal: "₹6,000",  label: "INR" },
  FR: { amount: 1800, yearlyAmount: 10800, currency: "eur", symbol: "€",   displayAmount: "€18",      displayFirstMonth: "€9",   displayYearlyPerMonth: "9",   displayYearlyTotal: "€108",    label: "EUR" },
  BE: { amount: 1800, yearlyAmount: 10800, currency: "eur", symbol: "€",   displayAmount: "€18",      displayFirstMonth: "€9",   displayYearlyPerMonth: "9",   displayYearlyTotal: "€108",    label: "EUR" },
  CH: { amount: 2000, yearlyAmount: 12000, currency: "chf", symbol: "Fr",  displayAmount: "CHF 20",   displayFirstMonth: "Fr10", displayYearlyPerMonth: "10",  displayYearlyTotal: "CHF 120", label: "CHF" },
};

export const DEFAULT_PRICING = COUNTRY_PRICING.US;

export function getPricing(countryCode: string): CountryPrice {
  return COUNTRY_PRICING[countryCode?.toUpperCase()] ?? DEFAULT_PRICING;
}
