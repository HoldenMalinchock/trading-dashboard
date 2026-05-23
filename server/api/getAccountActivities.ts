import { Pagination, type PaginationType } from "~/utils/types/Pagination";
import type { AccountActivityType } from "~/utils/types/Alpaca";

export default defineEventHandler<{ query: PaginationType }>(
  async (event): Promise<AccountActivityType[]> => {
    const query = await getValidatedQuery(event, (query) =>
      Pagination.safeParse(query),
    );
    if (!query.success) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid Query Parameters: ${query.error.issues[0]["path"][0]} - ${query.error.issues[0]["code"]}`,
      });
    }
    const runtimeConfig = useRuntimeConfig();
    // We need to make a request to the alpaca api to get the account information
    // Get the % up we are alltime and return that in a value so we can use it on our website
    return $fetch(
      `https://paper-api.alpaca.markets/v2/account/activities?direction=${query.data.direction}&page_size=${query.data.pageSize}`,
      {
        headers: {
          "APCA-API-KEY-ID": runtimeConfig.alpacaApiKey ?? "",
          "APCA-API-SECRET-KEY": runtimeConfig.alpacaSecretKey ?? "",
          accept: "application/json",
        },
      },
    );
  },
);
