<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref } from 'vue';

const isUserMenuOpen = ref(false);

// Navigation items for the sidebar
const navItems = [
  {
    name: 'Abteilungen',
    path: '/admin/departments',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    name: 'Kategorien',
    path: '/admin/categories',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  },
  {
    name: 'Tags',
    path: '/admin/tags',
    icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
  },
  {
    name: 'Benutzer',
    path: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    name: 'News',
    path: '/admin/news',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
];
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden">
    <!-- Header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 h-16 bg-vsg-blue-900 border-b border-vsg-gold-400/20"
    >
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-vsg-gold-400 rounded-lg flex items-center justify-center"
          >
            <span class="font-display text-vsg-blue-900 text-xl tracking-tight"
              >VK</span
            >
          </div>
          <div class="hidden sm:block">
            <span class="font-display text-xl tracking-wider text-white"
              >VSG KUGELBERG</span
            >
            <span
              class="block text-[10px] font-body font-extralight tracking-[0.3em] text-vsg-gold-400 uppercase"
              >Admin Dashboard</span
            >
          </div>
        </RouterLink>

        <!-- User Menu -->
        <div
          class="relative"
          @mouseenter="isUserMenuOpen = true"
          @mouseleave="isUserMenuOpen = false"
        >
          <button
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-vsg-blue-800 transition-colors"
          >
            <span
              class="hidden sm:block font-body font-extralight text-sm text-vsg-blue-200"
              >Max Mustermann</span
            >
            <div
              class="w-10 h-10 bg-vsg-blue-700 rounded-full flex items-center justify-center border-2 border-vsg-gold-400/30"
            >
              <svg
                class="w-5 h-5 text-vsg-gold-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div
              v-if="isUserMenuOpen"
              class="absolute top-full right-0 mt-2 w-48 bg-vsg-blue-900 border border-vsg-gold-400/20 rounded-lg shadow-xl"
            >
              <div class="py-2">
                <div class="px-4 py-2 border-b border-vsg-gold-400/10">
                  <span class="block font-body text-sm text-white"
                    >Max Mustermann</span
                  >
                  <span
                    class="block font-body font-extralight text-xs text-vsg-blue-300"
                    >admin@vsg-kugelberg.de</span
                  >
                </div>
                <RouterLink
                  to="/login"
                  class="flex items-center gap-2 px-4 py-2 font-body font-extralight text-sm text-vsg-gold-300 hover:text-vsg-gold-400 hover:bg-vsg-blue-800/50 transition-colors"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Abmelden
                </RouterLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex pt-16 min-h-screen">
      <!-- Sidebar -->
      <aside
        class="fixed left-0 top-16 bottom-0 w-64 bg-vsg-blue-950 border-r border-vsg-gold-400/10 overflow-y-auto"
      >
        <nav class="py-6">
          <div class="px-4 mb-4">
            <span
              class="font-body font-extralight text-xs tracking-widest text-vsg-blue-400 uppercase"
              >Navigation</span
            >
          </div>

          <ul class="space-y-1">
            <li v-for="item in navItems" :key="item.path">
              <RouterLink
                :to="item.path"
                class="sidebar-link flex items-center gap-3 px-4 py-3 border-l-4 border-transparent hover:bg-vsg-blue-800/30 hover:border-l-vsg-gold-400/50 transition-all"
                active-class="active"
              >
                <svg
                  class="w-5 h-5 text-vsg-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="item.icon"
                  />
                </svg>
                <span
                  class="font-body font-extralight text-sm text-vsg-blue-200"
                  >{{ item.name }}</span
                >
              </RouterLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64 p-8 bg-white min-h-screen">
        <router-view />
      </main>
    </div>
  </div>
</template>
