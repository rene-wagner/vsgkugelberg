<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  username: string;
}>();

const emit = defineEmits<{
  close: [];
  logout: [];
}>();

const isPostsPanelOpen = ref(false);

const quickLinks = [
  { label: 'Mein Profil', path: '/profil' },
  { label: 'Einstellungen', path: '/einstellungen' },
  { label: 'Nachrichten', path: '/nachrichten' },
  { label: 'Hilfe', path: '/hilfe' },
];

// Reset posts panel when drawer closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      isPostsPanelOpen.value = false;
    }
  }
);

const handleOverlayClick = () => {
  emit('close');
};

const handleCloseClick = () => {
  emit('close');
};

const handleLogoutClick = () => {
  emit('logout');
};

const openPostsPanel = () => {
  isPostsPanelOpen.value = true;
};

const closePostsPanel = () => {
  isPostsPanelOpen.value = false;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="fixed inset-0 z-60">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="handleOverlayClick" />

        <!-- Second-Level Posts Panel -->
        <Transition name="posts-panel">
          <div
            v-if="isPostsPanelOpen"
            class="absolute top-0 right-80 left-0 h-full bg-white shadow-xl"
          >
            <!-- Posts Panel Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Beiträge</h2>
                <button
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Panel schliessen"
                  @click="closePostsPanel"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
            </div>

            <!-- Posts Panel Content -->
            <div class="p-4">
              <p class="text-gray-600">
                Hier werden zukünftig Ihre Beiträge angezeigt und verwaltet.
              </p>
            </div>
          </div>
        </Transition>

        <!-- Drawer Panel -->
        <div
          class="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl transform transition-transform"
        >
          <!-- Header -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Schnellzugriff</h2>
              <button
                type="button"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Drawer schliessen"
                @click="handleCloseClick"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
            <p class="mt-2 text-sm text-gray-600">
              Eingeloggt als <span class="font-semibold text-gray-900">{{ username }}</span>
            </p>
          </div>

          <!-- Content -->
          <nav class="p-4">
            <!-- Beiträge Action Button -->
            <button
              type="button"
              class="w-full mb-4 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
              @click="openPostsPanel"
            >
              <span>Beiträge</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <ul class="space-y-1">
              <li v-for="link in quickLinks" :key="link.path">
                <a
                  :href="link.path"
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#00295e] rounded-lg transition-colors"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Footer with Logout -->
          <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              type="button"
              class="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              @click="handleLogoutClick"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}

/* Posts Panel Transitions */
.posts-panel-enter-active,
.posts-panel-leave-active {
  transition: transform 0.3s ease;
}

.posts-panel-enter-from,
.posts-panel-leave-to {
  transform: translateX(-100%);
}
</style>
