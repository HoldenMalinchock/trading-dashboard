import type { AlpacaAccount } from "~/utils/types/Alpaca"

// Paper accounts start with $100,000. All-time % change is computed against
// that baseline so the dashboard can show "+X% all-time".
const STARTING_EQUITY = 100_000

export default defineEventHandler(async () => {
  const alpacaAccount: AlpacaAccount = await $fetch("/api/getAccount")
  // Use parseFloat so cents aren't dropped (portfolio_value is a string like "100123.45").
  const accountValue = parseFloat(alpacaAccount.portfolio_value)
  // Percent change vs. the $100k starting baseline.
  // The previous implementation divided by 1000 instead of (STARTING_EQUITY / 100),
  // which produced values 100x too large.
  const percentChange = ((accountValue - STARTING_EQUITY) / STARTING_EQUITY) * 100
  return {
    change: `${percentChange.toFixed(2)}`,
    total: accountValue,
  }
})
