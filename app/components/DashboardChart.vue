<template>
  <div class="w-full min-h-0">
    <UCard
      class="h-full"
      :ui="{ body: 'flex flex-col h-full min-h-0 p-4' }"
    >
      <div
        v-if="error"
        class="flex items-center justify-center py-8 text-red-400"
      >
        Failed to load portfolio data. Please try again.
      </div>

      <template v-else>
        <div class="flex items-start justify-between mb-3 shrink-0">
          <div class="flex flex-col gap-1">
            <div class="text-2xl font-bold tracking-tight">
              {{ formattedEquity }}
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span
                :class="changeColor"
                class="font-medium"
              >
                {{ changeDisplay }} all-time
              </span>
              <span
                :class="periodPnlColor"
                class="font-medium"
              >
                {{ formattedPeriodPnl }} this period
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <USelectMenu
              v-model="timeframe"
              :items="timeframes"
              size="sm"
            />
            <UButton
              icon="i-heroicons-arrow-path"
              size="sm"
              color="primary"
              variant="solid"
              :loading="status === 'pending'"
              @click="refresh()"
            />
          </div>
        </div>

        <div
          ref="chartContainer"
          class="flex-1 min-h-0 w-full"
        />
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import {
  createChart,
  BaselineSeries,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts"
import type { PortfolioHistoryType } from "~/utils/types/Alpaca"

const timeframes = ["1M", "7D", "14D", "21D"]
const timeframe = ref(timeframes[0])

const { data: accountPerformance } = await useFetch("/api/allTimePercent")

const { data: portfolioHistory, refresh, status, error } = await useFetch<PortfolioHistoryType>("/api/getAccountHistory", {
  query: { period: timeframe },
})

// ── Derived stats ─────────────────────────────────────────────────────────────

const currentEquity = computed<number>(() => {
  const arr = portfolioHistory.value?.equity
  return arr && arr.length > 0 ? arr[arr.length - 1] ?? 0 : 0
})

const formattedEquity = computed(() =>
  currentEquity.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
)

const changeValue = computed(() => parseFloat(accountPerformance.value?.change ?? "0"))
const isPositive = computed(() => changeValue.value >= 0)
const changeDisplay = computed(() => `${isPositive.value ? "+" : ""}${changeValue.value.toFixed(2)}%`)
const changeColor = computed(() => isPositive.value ? "text-green-500" : "text-red-500")

const periodPnl = computed<number>(() => {
  const base = portfolioHistory.value?.base_value ?? 0
  return currentEquity.value - base
})

const formattedPeriodPnl = computed(() => {
  const val = periodPnl.value
  const formatted = Math.abs(val).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
  return val >= 0 ? `+${formatted}` : `-${formatted}`
})

const periodPnlColor = computed(() => periodPnl.value >= 0 ? "text-green-500" : "text-red-500")

// ── Chart data normalization ──────────────────────────────────────────────────

const chartData = computed(() => {
  if (!portfolioHistory.value) return []
  const seen = new Set<number>()
  return portfolioHistory.value.timestamp
    .map((ts, idx) => ({
      time: parseInt(ts) as UTCTimestamp,
      value: portfolioHistory.value!.equity[idx],
    }))
    .filter((d) => {
      if (seen.has(d.time)) return false
      seen.add(d.time)
      return true
    })
    .sort((a, b) => (a.time as number) - (b.time as number))
})

// ── Chart lifecycle ───────────────────────────────────────────────────────────

const chartContainer = ref<HTMLElement | null>(null)
let chart: IChartApi | null = null
let series: ISeriesApi<"Baseline"> | null = null
let resizeObserver: ResizeObserver | null = null

const renderChart = () => {
  if (!chart || !series || !portfolioHistory.value) return
  series.applyOptions({
    baseValue: { type: "price", price: portfolioHistory.value.base_value },
  })
  series.setData(chartData.value)
  chart.timeScale().fitContent()
}

onMounted(async () => {
  await nextTick()
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    layout: {
      background: { color: "transparent" },
      textColor: "#9ca3af",
      fontFamily: "inherit",
    },
    grid: {
      vertLines: { color: "rgba(75, 85, 99, 0.15)" },
      horzLines: { color: "rgba(75, 85, 99, 0.15)" },
    },
    crosshair: {
      mode: CrosshairMode.Magnet,
      vertLine: {
        color: "#6b7280",
        width: 1,
        style: LineStyle.Dashed,
        labelBackgroundColor: "#374151",
      },
      horzLine: {
        color: "#6b7280",
        width: 1,
        style: LineStyle.Dashed,
        labelBackgroundColor: "#374151",
      },
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: { top: 0.1, bottom: 0.1 },
      autoScale: true,
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
    },
    handleScale: false,
    handleScroll: false,
  })

  series = chart.addSeries(BaselineSeries, {
    baseValue: { type: "price", price: portfolioHistory.value?.base_value ?? 0 },
    topLineColor: "#00C16A",
    topFillColor1: "rgba(0, 193, 106, 0.28)",
    topFillColor2: "rgba(0, 193, 106, 0.05)",
    bottomLineColor: "#ef4444",
    bottomFillColor1: "rgba(239, 68, 68, 0.05)",
    bottomFillColor2: "rgba(239, 68, 68, 0.28)",
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false,
    priceFormat: {
      type: "price",
      precision: 0,
      minMove: 1,
    },
  })

  renderChart()

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry || !chart) return
    const { width, height } = entry.contentRect
    chart.applyOptions({ width, height })
  })
  resizeObserver.observe(chartContainer.value)
})

watch(chartData, () => renderChart())

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.remove()
  chart = null
  series = null
})
</script>
