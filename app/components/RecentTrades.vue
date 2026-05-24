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
              size="sm"
              icon="i-heroicons-magnifying-glass-20-solid"
            />
            <USelect
              v-model="sortBy"
              :options="sortOptions"
              size="sm"
            />
          </div>
        </div>
      </template>

      <div class="overflow-y-auto flex-1 min-h-0">
        <div v-if="!filteredActivities || filteredActivities.length === 0" class="p-4 text-center text-gray-400">
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
                <div class="font-semibold text-base flex-shrink-0">
                  {{ activity.symbol }}
                </div>
                <div class="text-xs text-gray-400 whitespace-nowrap">
                  {{ formatTime(activity.transaction_time) }}
                </div>
              </div>
              <div class="text-xs text-gray-500 mt-1 truncate">
                {{ activity.side === 'buy' ? 'BUY' : 'SELL' }} · {{ activity.qty }} @ ${{ parseFloat(activity.price).toFixed(2) }}
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-2">
              <div class="font-semibold text-sm" :class="sideColor(activity.side)">
                {{ activity.side === 'buy' ? '-' : '+' }}${{ (parseFloat(activity.price) * activity.qty).toFixed(2) }}
              </div>
              <div class="text-xs text-gray-400">
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

// Only FILL activities are actual trades — the prior `!== "FEE"` filter let
// through DIV, ACATC, etc. which don't carry transaction_time and were the
// source of the "Invalid Date" rows.
const { data: activities } = await useFetch<AccountActivityType[]>("/api/getAccountActivities", {
  transform: (activities) => {
    return activities.filter(activity => activity.activity_type === "FILL")
      .sort((a, b) => new Date(b.transaction_time).getTime() - new Date(a.transaction_time).getTime())
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

const filteredActivities = computed(() => {
  let filtered = activities.value ?? []

  // Filter by symbol
  if (searchSymbol.value) {
    filtered = filtered.filter(a => a.symbol.toUpperCase().includes(searchSymbol.value.toUpperCase()))
  }

  // Sort
  switch (sortBy.value) {
    case "oldest":
      return filtered.sort((a, b) => new Date(a.transaction_time).getTime() - new Date(b.transaction_time).getTime())
    case "symbol_asc":
      return filtered.sort((a, b) => a.symbol.localeCompare(b.symbol))
    case "symbol_desc":
      return filtered.sort((a, b) => b.symbol.localeCompare(a.symbol))
    case "size_desc":
      return filtered.sort((a, b) => b.qty - a.qty)
    case "size_asc":
      return filtered.sort((a, b) => a.qty - b.qty)
    case "recent":
    default:
      return filtered.sort((a, b) => new Date(b.transaction_time).getTime() - new Date(a.transaction_time).getTime())
  }
})

const sideClass = (side: string) => {
  return side === "buy"
    ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
    : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
}

const sideColor = (side: string) => {
  return side === "buy" ? "text-green-400" : "text-red-400"
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
