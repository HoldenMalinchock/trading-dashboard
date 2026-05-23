export interface AlpacaPosition {
  asset_id: string
  asset_class: string
  symbol: string
  exchange: string
  asset_easy_to_borrow: boolean
  qty: number
  avg_entry_price: string
  side: "long" | "short"
  market_value: string
  cost_basis: string
  unrealized_gain: string
  unrealized_gain_pct: string
  current_price: string
  lastday_price: string
  change_today: string
  change_today_pct: string
}

export default defineEventHandler(async (event): Promise<AlpacaPosition[]> => {
  const runtimeConfig = useRuntimeConfig()

  try {
    return await $fetch<AlpacaPosition[]>("https://paper-api.alpaca.markets/v2/positions", {
      headers: {
        "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
        "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
        "accept": "application/json",
      },
    })
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch positions from Alpaca" })
  }
})
