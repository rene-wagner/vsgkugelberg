<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const quickLinks = [
  { label: 'Mein Profil', path: '/profil' },
  { label: 'Einstellungen', path: '/einstellungen' },
  { label: 'Meine Beiträge', path: '/meine-beitraege' },
  { label: 'Nachrichten', path: '/nachrichten' },
  { label: 'Hilfe', path: '/hilfe' },
];

const handleOverlayClick = () => {
  emit('close');
};

const handleCloseClick = () => {
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="fixed inset-0 z-60">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="handleOverlayClick" />

        <!-- Drawer Panel -->
        <div
          class="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl transform transition-transform"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
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

          <!-- Content -->
          <nav class="p-4">
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
</style>
