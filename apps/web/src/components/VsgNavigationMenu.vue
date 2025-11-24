<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

export type VsgMenuItem = {
  label: string;
  path?: string;
  children?: VsgMenuItem[];
};

defineProps<{
  menuItems: VsgMenuItem[];
}>();

const isMobileMenuOpen = ref(false);
const activeMobileDropdown = ref<string | null>(null);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (!isMobileMenuOpen.value) {
    activeMobileDropdown.value = null;
  }
};

const toggleMobileDropdown = (label: string) => {
  if (activeMobileDropdown.value === label) {
    activeMobileDropdown.value = null;
  } else {
    activeMobileDropdown.value = label;
  }
};
</script>

<template>
  <nav class="relative">
    <!-- Desktop Menu -->
    <ul class="hidden md:flex space-x-8 items-center">
      <li v-for="item in menuItems" :key="item.label" class="relative group">
        <template v-if="item.children && item.children.length > 0">
          <button
            class="flex items-center space-x-1 text-white hover:text-[#ddad1e] transition-colors duration-200 py-2 focus:outline-none"
            aria-haspopup="true"
          >
            <span>{{ item.label }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Desktop Dropdown -->
          <div
            class="absolute right-0 mt-0 w-48 bg-[#00295e] rounded-md shadow-xl border border-[#ddad1e]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50"
          >
            <div class="py-1">
              <template v-for="child in item.children" :key="child.label">
                <RouterLink
                  v-if="child.path"
                  :to="child.path"
                  class="block px-4 py-2 text-sm text-white hover:bg-[#ddad1e] hover:text-[#00295e] transition-colors"
                >
                  {{ child.label }}
                </RouterLink>
                <span v-else class="block px-4 py-2 text-sm text-gray-400">
                  {{ child.label }}
                </span>
              </template>
            </div>
          </div>
        </template>

        <template v-else>
          <RouterLink
            v-if="item.path"
            :to="item.path"
            class="text-white hover:text-[#ddad1e] transition-colors duration-200 font-medium"
            active-class="text-[#ddad1e]"
          >
            {{ item.label }}
          </RouterLink>
          <span v-else class="text-white cursor-default">{{ item.label }}</span>
        </template>
      </li>
    </ul>

    <!-- Mobile Menu Button -->
    <div class="md:hidden flex items-center">
      <button
        type="button"
        class="text-white hover:text-[#ddad1e] focus:outline-none p-2"
        aria-label="Main menu"
        @click="toggleMobileMenu"
      >
        <svg
          v-if="!isMobileMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-show="isMobileMenuOpen"
      class="fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-[#00295e] border-[#ddad1e]/20 shadow-lg md:hidden flex flex-col z-40 overflow-y-auto"
    >
      <div class="flex flex-col py-4 container mx-auto px-4">
        <template v-for="item in menuItems" :key="item.label">
          <!-- Mobile Dropdown Parent -->
          <div
            v-if="item.children && item.children.length > 0"
            class="border-b border-[#ddad1e]/10 last:border-0"
          >
            <button
              class="w-full flex items-center justify-between py-4 text-white hover:text-[#ddad1e] transition-colors"
              @click="toggleMobileDropdown(item.label)"
            >
              <span class="font-medium text-lg">{{ item.label }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transition-transform duration-200"
                :class="{ 'rotate-180': activeMobileDropdown === item.label }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Mobile Dropdown Children -->
            <div
              v-show="activeMobileDropdown === item.label"
              class="bg-[#00204a] rounded-lg mb-2 overflow-hidden"
            >
              <template v-for="child in item.children" :key="child.label">
                <RouterLink
                  v-if="child.path"
                  :to="child.path"
                  class="block px-6 py-3 text-gray-300 hover:text-[#ddad1e] hover:bg-[#00295e] transition-colors"
                  @click="isMobileMenuOpen = false"
                >
                  {{ child.label }}
                </RouterLink>
                <span v-else class="block px-6 py-3 text-gray-500">
                  {{ child.label }}
                </span>
              </template>
            </div>
          </div>

          <!-- Mobile Simple Link -->
          <RouterLink
            v-else-if="item.path"
            :to="item.path"
            class="block py-4 text-white hover:text-[#ddad1e] transition-colors font-medium text-lg border-b border-[#ddad1e]/10 last:border-0"
            active-class="text-[#ddad1e]"
            @click="isMobileMenuOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>
