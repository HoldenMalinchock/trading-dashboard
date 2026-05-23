<template>
  <nav class="p-4">
    <ul>
      <li
        v-for="item, index in navItems"
        :key="index"
        class="hover:text-primary bg-slate-100 dark:bg-slate-900"
      >
        <div>
          <ULink
            :to="item.to"
            class="relative flex items-center gap-1.5 focus:outline-none focus-visible:outline-none
                  dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-1 focus-visible:before:ring-primary-500
                  dark:focus-visible:before:ring-primary-400 before:absolute before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75 px-2.5
                  py-1.5 w-full focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 rounded-md font-medium text-sm text-gray-800
                  dark:text-gray-300 hover:text-primary hover:before:bg-gray-50 dark:hover:before:bg-gray-800/50"
            active-class="bg-primary/50"
            @click="updateActiveClass(index)"
          >
            <UIcon :name="item.icon" />
            <span class="hover:text-primary relative">{{ item.label }}</span>
            <UIcon
              v-if="item.children"
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200"
              :class="[subActiveShow.includes(index) && 'rotate-90']"
            />
          </ULink>
          <div v-if="item.children && subActiveShow.includes(index)">
            <ul
              v-for="child, childIndex in item.children"
              :key="childIndex"
              class="px-5 text-sm"
            >
              <li>
                <ULink
                  :to="child.to"
                  class="relative flex items-center gap-1.5 focus:outline-none focus-visible:outline-none
                  dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-1 focus-visible:before:ring-primary-500
                  dark:focus-visible:before:ring-primary-400 before:absolute before:inset-px before:rounded-md disabled:cursor-not-allowed disabled:opacity-75 px-2.5
                  py-1.5 w-full focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400 rounded-md font-medium text-sm text-gray-800
                  dark:text-gray-300 hover:text-primary hover:before:bg-gray-50 dark:hover:before:bg-gray-800/50"
                  active-class="bg-primary/50"
                >
                  <span class="hover:text-primary relative">{{ child.label }}</span>
                </ULink>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const subActiveShow = ref<number[]>([])

const updateActiveClass = (index: number) => {
  subActiveShow.value.includes(index) ? subActiveShow.value.splice(subActiveShow.value.indexOf(index), 1) : subActiveShow.value.push(index)
}

const navItems = [
  {
    label: "Dashboard",
    icon: "i-heroicons-chart-bar",
    to: "/",
  },
  {
    label: "About",
    icon: "i-heroicons-folder",
    to: "/about",
  },
]
</script>
