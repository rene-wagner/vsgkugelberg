<script setup lang="ts">
import type { MediaItem } from '../stores/mediaStore';

const emit = defineEmits<{
  close: [];
}>();

defineProps<{
  item: MediaItem | null;
  mediaUrl: string;
  hasThumbnails: boolean;
  canHaveThumbnails: boolean;
}>();

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="item"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="relative max-w-4xl max-h-full">
        <button
          type="button"
          class="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
          @click="emit('close')"
        >
          <FontAwesomeIcon icon="xmark" />
        </button>

        <img
          :src="mediaUrl"
          :alt="item.originalName"
          class="max-w-full max-h-[80vh] object-contain rounded-lg"
        />

        <div class="mt-4 text-center">
          <p class="font-body text-white">{{ item.originalName }}</p>
          <p class="font-body text-sm text-white/70">{{ formatFileSize(item.size) }}</p>

          <div
            v-if="canHaveThumbnails"
            class="mt-2"
          >
            <span
              v-if="hasThumbnails"
              class="inline-flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded text-white"
            >
              <FontAwesomeIcon icon="check" />
              Thumbnails vorhanden
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/80 rounded text-xs text-white"
            >
              <FontAwesomeIcon icon="triangle-exclamation" />
              Keine Thumbnails
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
