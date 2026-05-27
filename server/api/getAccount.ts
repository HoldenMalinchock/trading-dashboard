import type { AlpacaAccount } from "~/utils/types/Alpaca"

export default defineEventHandler(async (): Promise<AlpacaAccount> => {
  const runtimeConfig = useRuntimeConfig()
  try {
    return await $fetch<AlpacaAccount>("https://paper-api.alpaca.markets/v2/account", {
      headers: {
        "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
        "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
        "accept": "application/json",
      },
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch account from Alpaca",
    })
  }
})
