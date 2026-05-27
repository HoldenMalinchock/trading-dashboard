import { z } from "zod"
import { Pagination, type PaginationType } from "~/utils/types/Pagination"
import { AccountActivitySchema, type AccountActivityType } from "~/utils/types/Alpaca"

const ActivitiesResponseSchema = z.array(AccountActivitySchema)

export default defineEventHandler<{ query: PaginationType }>(
  async (event): Promise<AccountActivityType[]> => {
    const query = await getValidatedQuery(event, (query) =>
      Pagination.safeParse(query),
    )
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid Query Parameters: ${query.error.issues[0]["path"][0]} - ${query.error.issues[0]["code"]}`,
      })
    }
    const runtimeConfig = useRuntimeConfig()

    // Restrict the response to FILL activities at the API level. The UI only
    // renders FILLs; filtering server-side avoids wasting payload and means
    // page_size actually corresponds to fills (previously a "page of 100" could
    // contain only a handful of FILLs after client-side filtering).
    const url =
      `https://paper-api.alpaca.markets/v2/account/activities` +
      `?activity_types=FILL` +
      `&direction=${encodeURIComponent(query.data.direction)}` +
      `&page_size=${query.data.pageSize}`

    const raw = await $fetch<unknown>(url, {
      headers: {
        "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
        "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
        accept: "application/json",
      },
    })

    // The schema is now actually applied (previously declared but never
    // validated). Optional fields tolerate non-FILL rows should they appear.
    const parsed = ActivitiesResponseSchema.safeParse(raw)
    if (!parsed.success) {
      throw createError({
        statusCode: 502,
        statusMessage: `Unexpected response from Alpaca: ${parsed.error.issues[0]?.message ?? "schema mismatch"}`,
      })
    }
    return parsed.data
  },
)
