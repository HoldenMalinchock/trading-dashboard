import type { AlpacaAccount } from "~/utils/types/Alpaca"

export default defineEventHandler(async () => {
  // We need to make a request to the alpaca api to get the account information
  // Get the % up we are alltime and return that in a value so we can use it on our website

  const alpacaAccount: AlpacaAccount = await $fetch("/api/getAccount")
  const accountValue = parseInt(alpacaAccount.portfolio_value)
  const percentChange = (accountValue - 100000) / 1000
  return {
    change: `${percentChange}`,
    total: accountValue,
  }
})
