<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  useMediaStore,
  type MediaItem,
  type MediaFolder,
} from '../stores/mediaStore';

const mediaStore = useMediaStore();

const previewItem = ref<MediaItem | null>(null);
const showDeleteConfirm = ref(false);
const itemToDelete = ref<MediaItem | null>(null);
const showFolderDeleteConfirm = ref(false);
const folderToDelete = ref<MediaFolder | null>(null);
const showMoveModal = ref(false);
const itemToMove = ref<MediaItem | null>(null);

const copiedId = ref<number | null>(null);
const regeneratingId = ref<number | null>(null);
const regeneratedId = ref<number | null>(null);

const hasContent = computed(
  () => mediaStore.media.length > 0 || mediaStore.folders.length > 0,
);

function navigateToFolder(folderId: number | null) {
  mediaStore.fetchMedia(1, 48, folderId);
  mediaStore.fetchFolders(folderId);
}

function confirmDeleteFolder(folder: MediaFolder) {
  folderToDelete.value = folder;
  showFolderDeleteConfirm.value = true;
}

async function executeDeleteFolder() {
  if (folderToDelete.value) {
    await mediaStore.deleteFolder(folderToDelete.value.id);
    folderToDelete.value = null;
    showFolderDeleteConfirm.value = false;
  }
}

function openMoveModal(item: MediaItem) {
  itemToMove.value = item;
  showMoveModal.value = true;
}

async function executeMove(targetFolderId: number | null) {
  if (itemToMove.value) {
    await mediaStore.moveMedia(itemToMove.value.id, targetFolderId);
    itemToMove.value = null;
    showMoveModal.value = false;
  }
}

function navigateUp() {
  const parentId = mediaStore.currentFolder?.parentId || null;
  navigateToFolder(parentId);
}

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

async function regenerateThumbnails(item: MediaItem) {
  regeneratingId.value = item.id;
  regeneratedId.value = null;

  const result = await mediaStore.regenerateThumbnails(item.id);

  regeneratingId.value = null;

  if (result) {
    regeneratedId.value = item.id;
    setTimeout(() => {
      regeneratedId.value = null;
    }, 2000);
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
    <div v-if="!hasContent" class="text-center py-12">
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
      <p class="font-body text-gray-500">
        Noch keine Medien oder Ordner vorhanden.
      </p>
      <p class="font-body text-sm text-gray-400 mt-1">
        Nutze die Upload-Zone oder "Neuer Ordner", um Inhalte hinzuzufugen.
      </p>
    </div>

    <!-- Gallery Grid -->
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <!-- Back to parent folder -->
      <div
        v-if="mediaStore.currentFolderId !== null"
        class="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        @click="navigateUp"
      >
        <svg
          class="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
        <span class="mt-2 font-body text-sm text-gray-600 font-medium">
          ..
        </span>
      </div>

      <!-- Folders -->
      <div
        v-for="folder in mediaStore.folders"
        :key="'folder-' + folder.id"
        class="group relative bg-vsg-blue-50 border border-vsg-blue-100 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-vsg-blue-100 transition-colors"
        @click="navigateToFolder(folder.id)"
      >
        <svg
          class="w-12 h-12 text-vsg-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
          />
        </svg>
        <span
          class="mt-2 font-body text-sm text-vsg-blue-900 font-medium px-2 text-center truncate w-full"
        >
          {{ folder.name }}
        </span>

        <!-- Folder Actions Overlay -->
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop
        >
          <button
            type="button"
            class="p-1.5 bg-white/80 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Ordner loschen"
            @click="confirmDeleteFolder(folder)"
          >
            <svg
              class="w-3.5 h-3.5"
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
      </div>

      <!-- Media Items -->
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

          <!-- Move Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="Verschieben"
            @click="openMoveModal(item)"
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
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

          <!-- Regenerate Thumbnails Button (only for non-SVG) -->
          <button
            v-if="mediaStore.canHaveThumbnails(item)"
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
            :title="
              regeneratedId === item.id
                ? 'Regeneriert!'
                : regeneratingId === item.id
                  ? 'Regeneriere...'
                  : 'Thumbnails regenerieren'
            "
            :disabled="regeneratingId === item.id"
            @click="regenerateThumbnails(item)"
          >
            <!-- Success icon -->
            <svg
              v-if="regeneratedId === item.id"
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
            <!-- Loading spinner -->
            <svg
              v-else-if="regeneratingId === item.id"
              class="w-4 h-4 text-vsg-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <!-- Default refresh icon -->
            <svg
              v-else
              class="w-4 h-4 text-vsg-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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
          class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <!-- Thumbnail info -->
            <div v-if="mediaStore.canHaveThumbnails(previewItem)" class="mt-2">
              <span
                v-if="mediaStore.hasThumbnails(previewItem)"
                class="inline-flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded text-xs text-white"
              >
                <svg
                  class="w-3 h-3"
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
                Thumbnails vorhanden
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/80 rounded text-xs text-white"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Keine Thumbnails
              </span>
            </div>
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

    <!-- Folder Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showFolderDeleteConfirm"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showFolderDeleteConfirm = false"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3
            class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4"
          >
            ORDNER LOSCHEN
          </h3>
          <p class="font-body text-gray-600 mb-6">
            Mochtest du den Ordner
            <strong>{{ folderToDelete?.name }}</strong> wirklich loschen? Alle
            Unterordner werden ebenfalls geloscht. Medien in diesem Ordner
            werden in das Hauptverzeichnis verschoben.
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
              @click="showFolderDeleteConfirm = false"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-red-600 text-white font-body text-sm rounded-lg hover:bg-red-700 transition-colors"
              @click="executeDeleteFolder"
            >
              Loschen
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Move Media Modal -->
    <Teleport to="body">
      <div
        v-if="showMoveModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showMoveModal = false"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3
            class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4"
          >
            MEDIUM VERSCHIEBEN
          </h3>
          <p class="font-body text-gray-600 mb-4">
            Wohin mochtest du
            <strong>{{ itemToMove?.originalName }}</strong> verschieben?
          </p>

          <div
            class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-6"
          >
            <button
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 flex items-center gap-3 transition-colors"
              @click="executeMove(null)"
            >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span class="font-body text-sm text-vsg-blue-900"
                >Mediathek (Root)</span
              >
            </button>
            <button
              v-for="folder in mediaStore.folders.filter(
                (f) => f.id !== mediaStore.currentFolderId,
              )"
              :key="'move-to-' + folder.id"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-3 transition-colors"
              @click="executeMove(folder.id)"
            >
              <svg
                class="w-5 h-5 text-vsg-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                />
              </svg>
              <span class="font-body text-sm text-vsg-blue-900">{{
                folder.name
              }}</span>
            </button>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
              @click="showMoveModal = false"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
