<template>
  <div class="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
    <div class="flex-1 flex flex-col gap-4 min-h-0">
      <dashboard-chart class="w-full h-1/3 shrink-0" />
      <active-positions class="w-full flex-1 min-h-0 overflow-hidden" />
    </div>
    <div class="w-full lg:w-96 h-full flex flex-col min-h-0">
      <recent-trades class="w-full flex-1 min-h-0" />
    </div>
  </div>
</template>
