import { z } from "zod"
import type { PortfolioHistoryType } from "~/utils/types/Alpaca"

const querySchema = z.object({
  period: z.enum(["7D", "14D", "21D", "1M"]).default("1M"),
})

export type queryType = z.infer<typeof querySchema>

export default defineEventHandler<{ query: queryType }> (async (event): Promise<PortfolioHistoryType> => {
  const query = await getValidatedQuery(event, query => querySchema.safeParse(query))
  if (!query.success) {
    throw createError({ statusCode: 400, statusMessage: `Invalid Query Parameters: ${query.error.issues[0]["path"][0]} - ${query.error.issues[0]["code"]}` })
  }
  const runtimeConfig = useRuntimeConfig()
  // We need to set the period to 1D
  return $fetch(`https://paper-api.alpaca.markets/v2/account/portfolio/history?period=${query.data.period}&intraday_reporting=market_hours&pnl_reset=per_day`, {
    headers: {
      "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
      "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
      "accept": "application/json",
    },
  })
})
