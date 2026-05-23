import { z } from "zod"

export const Pagination = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(100),
  direction: z.string().optional().default("desc"),
})

export type PaginationType = z.infer<typeof Pagination>
