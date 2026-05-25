<template>
  <div class="h-screen bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden">
    <nav class="shrink-0 h-14 px-4 flex items-center gap-6 border-b border-default bg-slate-200/60 dark:bg-slate-900/50 backdrop-blur">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-semibold text-highlighted"
      >
        <UIcon
          name="i-heroicons-chart-bar"
          class="w-5 h-5 text-primary-500 dark:text-primary-400"
        />
        <span>Trading Dashboard</span>
      </NuxtLink>

      <div class="flex items-center gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="linkClass(item.to)"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </nav>

    <main class="flex-1 min-h-0 p-4 overflow-y-auto lg:overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "About", to: "/about" },
]

const linkClass = (to: string) => {
  const isActive = to === "/" ? route.path === "/" : route.path.startsWith(to)
  const base = "px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
  return isActive
    ? `${base} bg-elevated text-highlighted`
    : `${base} text-muted hover:text-highlighted hover:bg-elevated/50`
}
</script>
