<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaStore, type MediaItem } from '../stores/mediaStore';

const mediaStore = useMediaStore();

const previewItem = ref<MediaItem | null>(null);
const showDeleteConfirm = ref(false);
const itemToDelete = ref<MediaItem | null>(null);
const copiedId = ref<number | null>(null);

const hasMedia = computed(() => mediaStore.media.length > 0);

function openPreview(item: MediaItem) {
  previewItem.value = item;
}

function closePreview() {
  previewItem.value = null;
}

function confirmDelete(item: MediaItem) {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
}

function cancelDelete() {
  itemToDelete.value = null;
  showDeleteConfirm.value = false;
}

async function executeDelete() {
  if (itemToDelete.value) {
    await mediaStore.deleteMedia(itemToDelete.value.id);
    itemToDelete.value = null;
    showDeleteConfirm.value = false;
  }
}

async function copyUrl(item: MediaItem) {
  const url = mediaStore.getMediaUrl(item);
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = item.id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  } catch {
    alert('URL konnte nicht kopiert werden');
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toUpperCase() || '';
}

function isSvg(item: MediaItem): boolean {
  return item.mimetype === 'image/svg+xml';
}
</script>

<template>
  <div>
    <!-- Empty State -->
    <div v-if="!hasMedia" class="text-center py-12">
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
      <p class="font-body text-gray-500">Noch keine Medien hochgeladen.</p>
      <p class="font-body text-sm text-gray-400 mt-1">
        Nutze die Upload-Zone oben, um Bilder hinzuzufugen.
      </p>
    </div>

    <!-- Gallery Grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <div
        v-for="item in mediaStore.media"
        :key="item.id"
        class="group relative bg-white border border-gray-200 rounded-lg overflow-hidden aspect-square"
      >
        <!-- Thumbnail -->
        <img
          :src="mediaStore.getMediaUrl(item)"
          :alt="item.originalName"
          class="w-full h-full object-cover"
          :class="{ 'p-2': isSvg(item) }"
        />

        <!-- Overlay with Actions -->
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <!-- Preview Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="Vorschau"
            @click="openPreview(item)"
          >
            <svg
              class="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <!-- Copy URL Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            :title="copiedId === item.id ? 'Kopiert!' : 'URL kopieren'"
            @click="copyUrl(item)"
          >
            <svg
              v-if="copiedId === item.id"
              class="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>

          <!-- Delete Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
            title="Loschen"
            @click="confirmDelete(item)"
          >
            <svg
              class="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        <!-- File Info Badge -->
        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <p class="font-body text-xs text-white truncate">
            {{ item.originalName }}
          </p>
          <p class="font-body text-xs text-white/70">
            {{ getFileExtension(item.filename) }} -
            {{ formatFileSize(item.size) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div
        v-if="previewItem"
        class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        @click.self="closePreview"
      >
        <div class="relative max-w-4xl max-h-full">
          <!-- Close Button -->
          <button
            type="button"
            class="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            @click="closePreview"
          >
            <svg
              class="w-6 h-6"
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

          <!-- Image -->
          <img
            :src="mediaStore.getMediaUrl(previewItem)"
            :alt="previewItem.originalName"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          <!-- Info -->
          <div class="mt-4 text-center">
            <p class="font-body text-white">{{ previewItem.originalName }}</p>
            <p class="font-body text-sm text-white/70">
              {{ formatFileSize(previewItem.size) }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3
            class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4"
          >
            MEDIUM LOSCHEN
          </h3>
          <p class="font-body text-gray-600 mb-6">
            Mochtest du dieses Medium wirklich loschen? Diese Aktion kann nicht
            ruckgangig gemacht werden.
          </p>

          <div v-if="itemToDelete" class="flex items-center gap-4 mb-6">
            <img
              :src="mediaStore.getMediaUrl(itemToDelete)"
              :alt="itemToDelete.originalName"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p class="font-body text-sm text-vsg-blue-900 font-medium">
                {{ itemToDelete.originalName }}
              </p>
              <p class="font-body text-xs text-gray-500">
                {{ formatFileSize(itemToDelete.size) }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
              @click="cancelDelete"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-red-600 text-white font-body text-sm rounded-lg hover:bg-red-700 transition-colors"
              @click="executeDelete"
            >
              Loschen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
