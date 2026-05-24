<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:h-full lg:overflow-hidden">
    <div class="flex flex-col gap-4 lg:flex-1 lg:min-h-0">
      <dashboard-chart class="w-full h-64 lg:h-1/3 lg:shrink-0" />
      <active-positions class="w-full h-96 lg:h-auto lg:flex-1 lg:min-h-0 lg:overflow-hidden" />
    </div>
    <div class="w-full lg:w-96 flex flex-col lg:h-full lg:min-h-0">
      <recent-trades class="w-full h-96 lg:h-auto lg:flex-1 lg:min-h-0" />
    </div>
  </div>
</template>
