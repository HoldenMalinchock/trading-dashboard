<script setup>
const colorMode = useColorMode()
colorMode.preference = 'dark'
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <div class="min-h-screen bg-secondary p-8">
      <UCard class="w-1/6">
        <template #header>
      <div>Header</div>
    </template>

    <div>Hello</div>
      </UCard>
    </div>=
  </UApp>
</template>
