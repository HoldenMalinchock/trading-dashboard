<template>
  <div class="w-full h-full min-h-0">
    <UCard
      class="w-full h-full overflow-hidden"
      :ui="{ body: 'flex flex-col h-full min-h-0' }"
    >
      <template #header>
        <div class="flex flex-col gap-3 w-full">
          <div class="text-lg font-semibold">Recent Trades</div>
          <div class="flex flex-col gap-2">
            <UInput
              v-model="searchSymbol"
              placeholder="Search symbol..."
              size="lg"
              icon="i-heroicons-magnifying-glass-20-solid"
            />
            <USelectMenu
              v-model="sortBy"
              :items="sortOptions"
              size="lg"
            />
          </div>
        </div>
      </template>

      <div class="overflow-y-auto flex-1 min-h-0">
        <div v-if="!filteredActivities || filteredActivities.length === 0" class="p-4 text-center text-muted">
          No trades found
        </div>
        <div v-else class="space-y-2 p-4">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="flex items-center justify-between p-3 rounded-lg border"
            :class="sideClass(activity.side)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 min-w-0">
                <div class="font-semibold text-base text-highlighted flex-shrink-0">
                  {{ activity.symbol }}
                </div>
                <div class="text-xs text-muted whitespace-nowrap">
                  {{ formatTime(activity.transaction_time) }}
                </div>
              </div>
              <div class="text-xs text-dimmed mt-1 truncate">
                {{ activity.side === 'buy' ? 'BUY' : 'SELL' }} · {{ qtyOf(activity) }} @ ${{ priceOf(activity).toFixed(2) }}
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-2">
              <div class="font-semibold text-sm" :class="sideColor(activity.side)">
                {{ activity.side === 'buy' ? '-' : '+' }}${{ (priceOf(activity) * qtyOf(activity)).toFixed(2) }}
              </div>
              <div class="text-xs text-muted">
                {{ activity.order_status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { AccountActivityType } from "~/utils/types/Alpaca"

// The server endpoint now restricts to FILL activities at the Alpaca API
// level (activity_types=FILL), so we no longer need to filter client-side.
// Trade fields (price, qty, side, transaction_time, symbol) are typed as
// optional on AccountActivityType to match Alpaca's union response shape,
// so helpers below coerce safely.
const { data: activities } = await useFetch<AccountActivityType[]>("/api/getAccountActivities", {
  transform: (activities) => {
    return [...activities].sort(
      (a, b) => timeOf(b) - timeOf(a),
    )
  },
})

const searchSymbol = ref("")
const sortBy = ref("recent")

const sortOptions = [
  { label: "Recent", value: "recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Symbol A-Z", value: "symbol_asc" },
  { label: "Symbol Z-A", value: "symbol_desc" },
  { label: "Largest", value: "size_desc" },
  { label: "Smallest", value: "size_asc" },
]

// Safe accessors — Alpaca returns numeric fields as strings, and non-FILL
// activities (should any slip through) may omit them entirely.
function qtyOf(a: AccountActivityType): number {
  return a.qty ? parseFloat(a.qty) : 0
}

function priceOf(a: AccountActivityType): number {
  return a.price ? parseFloat(a.price) : 0
}

function timeOf(a: AccountActivityType): number {
  if (!a.transaction_time) return 0
  const t = new Date(a.transaction_time).getTime()
  return Number.isNaN(t) ? 0 : t
}

const filteredActivities = computed(() => {
  let filtered = activities.value ?? []

  if (searchSymbol.value) {
    const needle = searchSymbol.value.toUpperCase()
    filtered = filtered.filter(a => (a.symbol ?? "").toUpperCase().includes(needle))
  }

  switch (sortBy.value) {
    case "oldest":
      return [...filtered].sort((a, b) => timeOf(a) - timeOf(b))
    case "symbol_asc":
      return [...filtered].sort((a, b) => (a.symbol ?? "").localeCompare(b.symbol ?? ""))
    case "symbol_desc":
      return [...filtered].sort((a, b) => (b.symbol ?? "").localeCompare(a.symbol ?? ""))
    case "size_desc":
      return [...filtered].sort((a, b) => qtyOf(b) - qtyOf(a))
    case "size_asc":
      return [...filtered].sort((a, b) => qtyOf(a) - qtyOf(b))
    case "recent":
    default:
      return [...filtered].sort((a, b) => timeOf(b) - timeOf(a))
  }
})

const sideClass = (side: string | undefined) => {
  return side === "buy"
    ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
    : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
}

const sideColor = (side: string | undefined) => {
  return side === "buy"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400"
}

const formatTime = (isoString: string | null | undefined) => {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
</script>
