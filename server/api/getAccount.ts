import type { AlpacaAccount } from "~/utils/types/Alpaca"

export default defineEventHandler((): Promise<AlpacaAccount> => {
  const runtimeConfig = useRuntimeConfig()
  // We need to make a request to the alpaca api to get the account information
  // Get the % up we are alltime and return that in a value so we can use it on our website
  return $fetch("https://paper-api.alpaca.markets/v2/account", {
    headers: {
      "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
      "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
      "accept": "application/json",
    },
  })
})
