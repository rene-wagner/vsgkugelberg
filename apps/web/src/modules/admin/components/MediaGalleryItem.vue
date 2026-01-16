<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  item: {
    id: number;
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  mediaUrl: string;
  hasThumbnails: boolean;
  canHaveThumbnails: boolean;
  copiedId: number | null;
  regeneratingId: number | null;
  regeneratedId: number | null;
}>();

const emit = defineEmits<{
  preview: [item: typeof props.item];
  move: [item: typeof props.item];
  copyUrl: [item: typeof props.item];
  regenerate: [item: typeof props.item];
  delete: [item: typeof props.item];
}>();

function isSvg(item: typeof props.item): boolean {
  return item.mimetype === 'image/svg+xml';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '';
}
</script>

<template>
  <div class="group relative bg-white border border-gray-200 rounded-lg overflow-hidden aspect-square">
    <img
      :src="mediaUrl"
      :alt="item.originalName"
      class="w-full h-full object-cover"
      :class="{ 'p-2': isSvg(item) }"
    />

    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      <button
        type="button"
        class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        title="Vorschau"
        @click="emit('preview', item)"
      >
        <FontAwesomeIcon
          icon="eye"
          class="text-gray-700"
        />
      </button>

      <button
        type="button"
        class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        title="Verschieben"
        @click="emit('move', item)"
      >
        <FontAwesomeIcon
          icon="arrow-right-arrow-left"
          class="text-gray-700"
        />
      </button>

      <button
        type="button"
        class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        :title="copiedId === item.id ? 'Kopiert!' : 'URL kopieren'"
        @click="emit('copyUrl', item)"
      >
        <FontAwesomeIcon
          icon="copy"
          class="text-gray-700"
        />
      </button>

      <button
        v-if="canHaveThumbnails"
        type="button"
        class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        :title="regeneratedId === item.id ? 'Regeneriert!' : regeneratingId === item.id ? 'Regeneriere...' : 'Thumbnails regenerieren'"
        :disabled="regeneratingId === item.id"
        @click="emit('regenerate', item)"
      >
        <FontAwesomeIcon
          v-if="regeneratedId === item.id"
          icon="check"
          class="text-gray-700"
        />
        <FontAwesomeIcon
          v-else-if="regeneratingId === item.id"
          icon="spinner"
          class="text-gray-700 animate-spin"
        />
        <FontAwesomeIcon
          v-else
          icon="arrows-rotate"
          class="text-gray-700"
        />
      </button>

      <button
        type="button"
        class="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-100 transition-colors"
        title="Löschen"
        @click="emit('delete', item)"
      >
        <FontAwesomeIcon icon="trash" />
      </button>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <p class="font-body text-xs text-white truncate">{{ item.originalName }}</p>
      <p class="font-body text-xs text-white/70">{{ getFileExtension(item.filename) }} - {{ formatFileSize(item.size) }}</p>
    </div>
  </div>
</template>
