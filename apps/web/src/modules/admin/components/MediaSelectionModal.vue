<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMediaStore, type MediaItem } from '../stores/mediaStore';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', media: MediaItem): void;
}>();

const mediaStore = useMediaStore();
const selectedItem = ref<MediaItem | null>(null);

const hasMedia = computed(() => mediaStore.media.length > 0);

onMounted(async () => {
  if (mediaStore.media.length === 0) {
    await mediaStore.fetchMedia(1, 100);
  }
});

function selectMedia(item: MediaItem) {
  selectedItem.value = item;
  emit('select', item);
  emit('close');
}

function handleClose() {
  emit('close');
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click="handleOverlayClick"
    >
      <div
        class="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-xl"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-gray-200"
        >
          <h2
            class="font-display text-xl tracking-wider text-vsg-blue-900 uppercase"
          >
            Mediathek
          </h2>
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleClose"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Loading State -->
          <div
            v-if="mediaStore.isLoading"
            class="flex items-center justify-center py-12"
          >
            <div class="text-vsg-blue-600 font-body">Laden...</div>
          </div>

          <!-- Error State -->
          <div
            v-else-if="mediaStore.error"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p class="text-sm text-red-600 font-body">{{ mediaStore.error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!hasMedia" class="text-center py-12">
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p class="font-body text-gray-500">Noch keine Medien vorhanden.</p>
            <p class="font-body text-sm text-gray-400 mt-1">
              Lade zuerst Bilder in der Mediathek hoch.
            </p>
          </div>

          <!-- Media Grid -->
          <div
            v-else
            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          >
            <button
              v-for="item in mediaStore.media"
              :key="item.id"
              type="button"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:border-vsg-blue-400 focus:outline-none focus:border-vsg-blue-600"
              :class="[
                selectedItem?.id === item.id
                  ? 'border-vsg-blue-600 ring-2 ring-vsg-blue-200'
                  : 'border-transparent',
              ]"
              @click="selectMedia(item)"
            >
              <img
                :src="mediaStore.getMediaUrl(item)"
                :alt="item.originalName"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p class="text-xs text-gray-500 font-body text-center">
            Klicke auf ein Bild, um es auszuwahlen
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
