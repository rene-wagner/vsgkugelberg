<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  currentPath: string;
}>();

interface NavItem {
  name: string;
  path?: string;
  icon?: string;
  children?: { name: string; path: string }[];
}

const navItems: NavItem[] = [
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

function isItemActive(item: NavItem): boolean {
  const currentPath = props.currentPath;

  if (!item.children && item.path) {
    return currentPath === item.path;
  }

  if (item.children && item.path) {
    return currentPath.startsWith(item.path);
  }

  return false;
}

watch(
  () => props.currentPath,
  () => {
    navItems.forEach((item) => {
      if (item.children && isItemActive(item)) {
        if (!expandedItems.value.includes(item.name)) {
          expandedItems.value.push(item.name);
        }
      } else if (item.children && !isItemActive(item)) {
        const index = expandedItems.value.indexOf(item.name);
        if (index > -1) {
          expandedItems.value.splice(index, 1);
        }
      }
    });
  },
  { immediate: true },
);
</script>

<template>
  <aside class="fixed left-0 top-16 bottom-0 w-64 bg-vsg-blue-950 border-r border-vsg-gold-400/10 overflow-y-auto">
    <nav class="py-6">
      <div class="px-4 mb-4">
        <span class="font-body font-normal text-xs tracking-widest text-vsg-blue-400 uppercase">Navigation</span>
      </div>

      <ul class="space-y-1">
        <li
          v-for="item in navItems"
          :key="item.name"
        >
          <template v-if="item.children">
            <button
              type="button"
              class="sidebar-link w-full flex items-center justify-between gap-3 px-4 py-3 border-l-4 border-transparent hover:bg-vsg-blue-800/30 hover:border-l-vsg-gold-400/50 transition-all text-left"
              :class="{ active: isItemActive(item) }"
              @click="toggleExpand(item.name)"
            >
              <div class="flex items-center gap-3">
                <FontAwesomeIcon
                  v-if="item.icon"
                  :icon="item.icon"
                  class="text-vsg-blue-400"
                />
                <span class="font-body font-normal text-sm text-vsg-blue-200">{{ item.name }}</span>
              </div>
              <FontAwesomeIcon
                icon="chevron-down"
                class="text-gray-400 transition-transform"
                :class="{ 'rotate-180': expandedItems.includes(item.name) }"
              />
            </button>

            <div
              class="overflow-hidden transition-all duration-300 ease-in-out"
              :style="{
                maxHeight: expandedItems.includes(item.name) ? `${item.children.length * 40}px` : '0',
              }"
            >
              <ul class="pl-12 space-y-1 py-1">
                <li
                  v-for="child in item.children"
                  :key="child.path"
                >
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

          <RouterLink
            v-else
            :to="item.path || ''"
            class="sidebar-link flex items-center gap-3 px-4 py-3 border-l-4 border-transparent hover:bg-vsg-blue-800/30 hover:border-l-vsg-gold-400/50 transition-all"
            active-class="active"
          >
            <FontAwesomeIcon
              v-if="item.icon"
              :icon="item.icon"
              class="text-vsg-blue-400"
            />
            <span class="font-body font-normal text-sm text-vsg-blue-200">{{ item.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
