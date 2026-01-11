<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import VsgToastContainer from '@shared/components/VsgToastContainer.vue';

const isUserMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Navigation items for the sidebar
const navItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: 'gauge',
  },
  {
    name: 'Startseite',
    path: '/admin/home',
    icon: 'house',
  },
  {
    name: 'Verein',
    icon: 'people-group',
    children: [
      { name: 'Geschichte', path: '/admin/verein/geschichte' },
      { name: 'Vorstand', path: '/admin/verein/vorstand' },
      { name: 'Satzung', path: '/admin/verein/satzung' },
      { name: 'Mitgliedschaft', path: '/admin/verein/mitgliedschaft' },
    ],
  },
  {
    name: 'Abteilungen',
    path: '/admin/abteilungen',
    icon: 'cubes',
  },
  {
    name: 'Termine',
    path: '/admin/termine',
    icon: 'calendar',
  },
  {
    name: 'Kontakt',
    path: '/admin/kontakt',
    icon: 'address-book',
  },
  {
    name: 'Kategorien',
    path: '/admin/kategorien',
    icon: 'sitemap',
  },
  {
    name: 'Beiträge',
    path: '/admin/beitraege',
    icon: 'newspaper',
  },
  {
    name: 'Mediathek',
    path: '/admin/mediathek',
    icon: 'image',
  },
  {
    name: 'Benutzer',
    path: '/admin/benutzer',
    icon: 'users',
  },
  {
    name: 'Einstellungen',
    path: '/admin/einstellungen',
    icon: 'cog',
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
  const currentPath = route.path;

  // For items without children (Dashboard, Startseite, etc.), check exact match
  if (!item.children && item.path) {
    return currentPath === item.path;
  }

  // For items with children (Verein), check if current path starts with parent path
  if (item.children && item.path) {
    return currentPath.startsWith(item.path);
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
      } else if (item.children && !isItemActive(item)) {
        // Collapse if no longer active
        const index = expandedItems.value.indexOf(item.name);
        if (index > -1) {
          expandedItems.value.splice(index, 1);
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
  <div class="min-h-screen text-vsg-blue-900 overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-vsg-blue-900 border-b border-vsg-gold-400/20">
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-vsg-gold-400 rounded-lg flex items-center justify-center">
            <span class="font-display text-vsg-blue-900 text-xl tracking-tight">VK</span>
          </div>
          <div class="hidden sm:block">
            <span class="font-display text-xl tracking-wider text-white">VSG KUGELBERG</span>
            <span class="block text-[10px] font-body font-normal tracking-[0.3em] text-vsg-gold-400 uppercase">Admin Dashboard</span>
          </div>
        </RouterLink>

        <!-- User Menu -->
        <div class="relative" @mouseenter="isUserMenuOpen = true" @mouseleave="isUserMenuOpen = false">
          <button class="flex items-center gap-3 p-2 rounded-lg hover:bg-vsg-blue-800 transition-colors">
            <span class="hidden sm:block font-body font-normal text-sm text-vsg-blue-200">{{ authStore.user?.username ?? 'Benutzer' }}</span>
            <div class="w-10 h-10 bg-vsg-blue-700 rounded-full flex items-center justify-center border-2 border-vsg-gold-400/30">
              <FontAwesomeIcon icon="user" class="text-vsg-gold-400" />
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
            <div v-if="isUserMenuOpen" class="absolute top-full right-0 mt-2 w-48 bg-vsg-blue-900 border border-vsg-gold-400/20 rounded-lg shadow-xl">
              <div class="py-2">
                <div class="px-4 py-2 border-b border-vsg-gold-400/10">
                  <span class="block font-body text-sm text-white">{{ authStore.user?.username ?? 'Benutzer' }}</span>
                  <span class="block font-body font-normal text-xs text-vsg-blue-300">{{ authStore.user?.email ?? '' }}</span>
                </div>
                <button
                  type="button"
                  class="flex items-center gap-2 px-4 py-2 w-full font-body font-normal text-sm text-vsg-gold-300 hover:text-vsg-gold-400 hover:bg-vsg-blue-800/50 transition-colors"
                  @click="handleLogout"
                >
                  <FontAwesomeIcon icon="right-from-bracket" />
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
      <aside class="fixed left-0 top-16 bottom-0 w-64 bg-vsg-blue-950 border-r border-vsg-gold-400/10 overflow-y-auto">
        <nav class="py-6">
          <div class="px-4 mb-4">
            <span class="font-body font-normal text-xs tracking-widest text-vsg-blue-400 uppercase">Navigation</span>
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
                    <FontAwesomeIcon :icon="item.icon" class="text-vsg-blue-400" />
                    <span class="font-body font-normal text-sm text-vsg-blue-200">{{ item.name }}</span>
                  </div>
                  <FontAwesomeIcon
                    icon="chevron-down"
                    class="text-gray-400 transition-transform"
                    :class="{ 'rotate-180': expandedItems.includes(item.name) }"
                  />
                </button>

                <!-- Submenu -->
                <div
                  class="overflow-hidden transition-all duration-300 ease-in-out"
                  :style="{
                    maxHeight: expandedItems.includes(item.name) ? `${item.children.length * 40}px` : '0',
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
                <FontAwesomeIcon :icon="item.icon" class="text-vsg-blue-400" />
                <span class="font-body font-normal text-sm text-vsg-blue-200">{{ item.name }}</span>
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
    <VsgToastContainer />
  </div>
</template>
