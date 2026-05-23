<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex justify-between items-center w-full">
        <div class="text-lg font-semibold">
          Active Positions
        </div>
        <div class="flex gap-2">
          <UButton
            size="sm"
            variant="soft"
            icon="i-heroicons-arrow-path"
            :loading="refreshing"
            @click="handleRefresh"
          />
        </div>
      </div>
    </template>

    <div
      v-if="loading"
      class="flex items-center justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin w-6 h-6"
      />
    </div>
    <div
      v-else-if="!positions || positions.length === 0"
      class="p-4 text-center text-gray-400"
    >
      No active positions
    </div>
    <div v-else>
      <!-- Summary stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 border-b border-gray-700">
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-xs text-gray-400 uppercase tracking-wide">
            Total Value
          </div>
          <div class="text-lg font-semibold text-white mt-1">
            {{ formatCurrency(totalMarketValue) }}
          </div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-xs text-gray-400 uppercase tracking-wide">
            Total Gain/Loss
          </div>
          <div
            class="text-lg font-semibold mt-1"
            :class="totalGainLossColor"
          >
            {{ formatCurrency(totalGainLoss) }} ({{ totalGainLossPercent.toFixed(2) }}%)
          </div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-xs text-gray-400 uppercase tracking-wide">
            Positions
          </div>
          <div class="text-lg font-semibold text-white mt-1">
            {{ positions.length }}
          </div>
        </div>
        <div class="bg-gray-800/50 rounded-lg p-3">
          <div class="text-xs text-gray-400 uppercase tracking-wide">
            Long/Short
          </div>
          <div class="text-lg font-semibold text-white mt-1">
            {{ longCount }}/{{ shortCount }}
          </div>
        </div>
      </div>

      <!-- Positions list -->
      <div class="overflow-y-auto max-h-96">
        <div class="space-y-2 p-4">
          <div
            v-for="position in positions"
            :key="position.asset_id"
            class="flex items-center justify-between p-4 rounded-lg border transition-colors"
            :class="positionBgClass(position)"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="font-semibold text-base min-w-16">
                  {{ position.symbol }}
                </div>
                <div
                  class="text-xs px-2 py-1 rounded-full"
                  :class="positionTagClass(position)"
                >
                  {{ position.side.toUpperCase() }}
                </div>
              </div>
              <div class="text-xs text-gray-400 space-y-1">
                <div>
                  {{ Math.abs(position.qty) }} shares @ ${{ parseFloat(position.current_price).toFixed(2) }}
                  <span class="ml-2 text-gray-500">
                    (Entry: ${{ parseFloat(position.avg_entry_price).toFixed(2) }})
                  </span>
                </div>
                <div>
                  Cost Basis: {{ formatCurrency(parseFloat(position.cost_basis)) }} ·
                  Portfolio: {{ calculatePortfolioPercent(position).toFixed(2) }}%
                </div>
              </div>
            </div>
            <div class="text-right min-w-32">
              <div class="font-semibold text-base mb-1">
                {{ formatCurrency(parseFloat(position.market_value)) }}
              </div>
              <div
                class="text-sm font-semibold"
                :class="gainLossColor(position)"
              >
                {{ gainLossDisplay(position) }}
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ changeDisplay(position) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AlpacaPosition } from "~/server/api/getPositions"

const positions = ref<AlpacaPosition[]>([])
const loading = ref(false)
const refreshing = ref(false)
const totalPortfolioValue = ref(0)

const { data: account } = await useFetch("/api/getAccount")

const fetchPositions = async () => {
  loading.value = true
  try {
    const data = await $fetch<AlpacaPosition[]>("/api/getPositions")
    positions.value = data || []
  }
  catch (error) {
    console.error("Failed to fetch positions:", error)
    positions.value = []
  }
  finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await fetchPositions()
  refreshing.value = false
}

// Calculate total metrics
const totalMarketValue = computed(() => {
  return positions.value.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0)
})

const totalCostBasis = computed(() => {
  return positions.value.reduce((sum, pos) => sum + parseFloat(pos.cost_basis), 0)
})

const totalGainLoss = computed(() => {
  return totalMarketValue.value - totalCostBasis.value
})

const totalGainLossPercent = computed(() => {
  if (totalCostBasis.value === 0) return 0
  return (totalGainLoss.value / totalCostBasis.value) * 100
})

const totalGainLossColor = computed(() => {
  return totalGainLoss.value >= 0 ? "text-green-400" : "text-red-400"
})

const longCount = computed(() => {
  return positions.value.filter(p => p.side === "long").length
})

const shortCount = computed(() => {
  return positions.value.filter(p => p.side === "short").length
})

// Helper functions
const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
}

const calculatePortfolioPercent = (position: AlpacaPosition) => {
  if (totalMarketValue.value === 0) return 0
  return (parseFloat(position.market_value) / totalMarketValue.value) * 100
}

// Helper to calculate unrealized gain
const calculateGainLoss = (position: AlpacaPosition) => {
  const marketValue = parseFloat(position.market_value)
  const costBasis = parseFloat(position.cost_basis)
  return marketValue - costBasis
}

// Helper to calculate unrealized gain percent
const calculateGainLossPercent = (position: AlpacaPosition) => {
  const costBasis = parseFloat(position.cost_basis)
  if (costBasis === 0) return 0
  const gainLoss = calculateGainLoss(position)
  return (gainLoss / costBasis) * 100
}

const positionBgClass = (position: AlpacaPosition) => {
  const unrealizedGainPct = calculateGainLossPercent(position)
  if (unrealizedGainPct >= 0) {
    return "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
  }
  else {
    return "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
  }
}

const positionTagClass = (position: AlpacaPosition) => {
  return position.side === "long"
    ? "bg-green-500/20 text-green-400"
    : "bg-red-500/20 text-red-400"
}

const gainLossColor = (position: AlpacaPosition) => {
  const gainLoss = calculateGainLoss(position)
  return gainLoss >= 0 ? "text-green-400" : "text-red-400"
}

const gainLossDisplay = (position: AlpacaPosition) => {
  const gainLoss = calculateGainLoss(position)
  const sign = gainLoss >= 0 ? "+" : ""
  return `${sign}${formatCurrency(gainLoss)}`
}

const changeDisplay = (position: AlpacaPosition) => {
  const percent = calculateGainLossPercent(position)
  const sign = percent >= 0 ? "+" : ""
  return `${sign}${percent.toFixed(2)}%`
}

// Initial fetch
await fetchPositions()
</script>
