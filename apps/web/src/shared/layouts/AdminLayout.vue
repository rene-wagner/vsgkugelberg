<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/authStore';

const isUserMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

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
    name: 'Verein',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    children: [
      { name: 'Geschichte', path: '/admin/club-history' },
      { name: 'Vorstand', path: '/admin/board' },
    ],
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
  {
    name: 'Veranstaltungen',
    path: '/admin/events',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    name: 'Ansprechpartner',
    path: '/admin/contact-persons',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    name: 'Mediathek',
    path: '/admin/media',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    name: 'Einstellungen',
    path: '/admin/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

const expandedItems = ref<string[]>([]);

function toggleExpand(itemName: string) {
  const index = expandedItems.value.indexOf(itemName);
  if (index > -1) {
    expandedItems.value.splice(index, 1);
  } else {
    expandedItems.value.push(itemName);
  }
}

// Check if a navigation item or any of its children is active
function isItemActive(item: any): boolean {
  if (item.path && route.path === item.path) return true;
  if (item.children) {
    return item.children.some((child: any) => route.path === child.path);
  }
  return false;
}

// Auto-expand parent if child is active
watch(
  () => route.path,
  () => {
    navItems.forEach((item) => {
      if (item.children && isItemActive(item)) {
        if (!expandedItems.value.includes(item.name)) {
          expandedItems.value.push(item.name);
        }
      }
    });
  },
  { immediate: true },
);

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
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
              class="block text-[10px] font-body font-normal tracking-[0.3em] text-vsg-gold-400 uppercase"
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
              class="hidden sm:block font-body font-normal text-sm text-vsg-blue-200"
              >{{ authStore.user?.username ?? 'Benutzer' }}</span
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
                  <span class="block font-body text-sm text-white">{{
                    authStore.user?.username ?? 'Benutzer'
                  }}</span>
                  <span
                    class="block font-body font-normal text-xs text-vsg-blue-300"
                    >{{ authStore.user?.email ?? '' }}</span
                  >
                </div>
                <button
                  type="button"
                  class="flex items-center gap-2 px-4 py-2 w-full font-body font-normal text-sm text-vsg-gold-300 hover:text-vsg-gold-400 hover:bg-vsg-blue-800/50 transition-colors"
                  @click="handleLogout"
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
                </button>
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
              class="font-body font-normal text-xs tracking-widest text-vsg-blue-400 uppercase"
              >Navigation</span
            >
          </div>

          <ul class="space-y-1">
            <li v-for="item in navItems" :key="item.name">
              <template v-if="item.children">
                <!-- Root item with children -->
                <button
                  type="button"
                  class="sidebar-link w-full flex items-center justify-between gap-3 px-4 py-3 border-l-4 border-transparent hover:bg-vsg-blue-800/30 hover:border-l-vsg-gold-400/50 transition-all text-left"
                  :class="{ active: isItemActive(item) }"
                  @click="toggleExpand(item.name)"
                >
                  <div class="flex items-center gap-3">
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
                      class="font-body font-normal text-sm text-vsg-blue-200"
                      >{{ item.name }}</span
                    >
                  </div>
                  <svg
                    class="w-4 h-4 text-vsg-blue-400 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedItems.includes(item.name) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Submenu -->
                <div
                  class="overflow-hidden transition-all duration-300 ease-in-out"
                  :style="{
                    maxHeight: expandedItems.includes(item.name)
                      ? `${item.children.length * 40}px`
                      : '0',
                  }"
                >
                  <ul class="pl-12 space-y-1 py-1">
                    <li v-for="child in item.children" :key="child.path">
                      <RouterLink
                        :to="child.path"
                        class="block py-2 font-body font-normal text-sm text-vsg-blue-300 hover:text-vsg-gold-400 transition-colors"
                        active-class="!text-vsg-gold-400"
                      >
                        {{ child.name }}
                      </RouterLink>
                    </li>
                  </ul>
                </div>
              </template>

              <!-- Standard root item -->
              <RouterLink
                v-else
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
                <span class="font-body font-normal text-sm text-vsg-blue-200">{{
                  item.name
                }}</span>
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
