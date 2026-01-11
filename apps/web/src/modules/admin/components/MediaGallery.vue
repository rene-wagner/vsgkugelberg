<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaStore, type MediaItem, type MediaFolder } from '../stores/mediaStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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

const hasContent = computed(() => mediaStore.media.length > 0 || mediaStore.folders.length > 0);

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
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FontAwesomeIcon icon="image" size="2x" class="text-gray-400" />
      </div>
      <p class="font-body text-gray-500">Noch keine Medien oder Ordner vorhanden.</p>
      <p class="font-body text-sm text-gray-400 mt-1">Nutze die Upload-Zone oder "Neuer Ordner", um Inhalte hinzuzufügen.</p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <!-- Back to parent folder -->
      <div
        v-if="mediaStore.currentFolderId !== null"
        class="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        @click="navigateUp"
      >
        <FontAwesomeIcon icon="arrow-left" size="2x" class="text-gray-400" />
      </div>

      <!-- Folders -->
      <div
        v-for="folder in mediaStore.folders"
        :key="'folder-' + folder.id"
        class="group relative bg-vsg-blue-50 border border-vsg-blue-100 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-vsg-blue-100 transition-colors"
        @click="navigateToFolder(folder.id)"
      >
        <FontAwesomeIcon icon="folder" size="2x" class="text-vsg-blue-900" />
        <span class="mt-2 font-body text-sm text-vsg-blue-900 font-medium px-2 text-center truncate w-full">
          {{ folder.name }}
        </span>

        <!-- Folder Actions Overlay -->
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
          <button
            type="button"
            class="p-1.5 bg-white/80 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Ordner löschen"
            @click="confirmDeleteFolder(folder)"
          >
            <FontAwesomeIcon icon="trash" />
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
        <img :src="mediaStore.getMediaUrl(item)" :alt="item.originalName" class="w-full h-full object-cover" :class="{ 'p-2': isSvg(item) }" />

        <!-- Overlay with Actions -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <!-- Preview Button -->
          <button type="button" class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors" title="Vorschau" @click="openPreview(item)">
            <FontAwesomeIcon icon="eye" class="text-gray-700" />
          </button>

          <!-- Move Button -->
          <button type="button" class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors" title="Verschieben" @click="openMoveModal(item)">
            <FontAwesomeIcon icon="arrow-right-arrow-left" class="text-gray-700" />
          </button>

          <!-- Copy URL Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            :title="copiedId === item.id ? 'Kopiert!' : 'URL kopieren'"
            @click="copyUrl(item)"
          >
            <FontAwesomeIcon icon="copy" class="text-gray-700" />
          </button>

          <!-- Regenerate Thumbnails Button (only for non-SVG) -->
          <button
            v-if="mediaStore.canHaveThumbnails(item)"
            type="button"
            class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            :title="regeneratedId === item.id ? 'Regeneriert!' : regeneratingId === item.id ? 'Regeneriere...' : 'Thumbnails regenerieren'"
            :disabled="regeneratingId === item.id"
            @click="regenerateThumbnails(item)"
          >
            <FontAwesomeIcon v-if="regeneratedId === item.id" icon="check" class="text-gray-700" />
            <FontAwesomeIcon v-else-if="regeneratingId === item.id" icon="spinner" class="text-gray-700 animate-spin" />
            <FontAwesomeIcon v-else icon="arrows-rotate" class="text-gray-700" />
          </button>

          <!-- Delete Button -->
          <button
            type="button"
            class="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-100 transition-colors"
            title="Löschen"
            @click="confirmDelete(item)"
          >
            <FontAwesomeIcon icon="trash" />
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
      <div v-if="previewItem" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" @click.self="closePreview">
        <div class="relative max-w-4xl max-h-full">
          <!-- Close Button -->
          <button type="button" class="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors" @click="closePreview">
            <FontAwesomeIcon icon="xmark" />
          </button>

          <!-- Image -->
          <img :src="mediaStore.getMediaUrl(previewItem)" :alt="previewItem.originalName" class="max-w-full max-h-[80vh] object-contain rounded-lg" />

          <!-- Info -->
          <div class="mt-4 text-center">
            <p class="font-body text-white">{{ previewItem.originalName }}</p>
            <p class="font-body text-sm text-white/70">
              {{ formatFileSize(previewItem.size) }}
            </p>
            <!-- Thumbnail info -->
            <div v-if="mediaStore.canHaveThumbnails(previewItem)" class="mt-2">
              <span v-if="mediaStore.hasThumbnails(previewItem)" class="inline-flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded text-white">
                <FontAwesomeIcon icon="check" />
                Thumbnails vorhanden
              </span>
              <span v-else class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600/80 rounded text-xs text-white">
                <FontAwesomeIcon icon="triangle-exclamation" />
                Keine Thumbnails
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="cancelDelete">
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">Medium löschen</h3>
          <p class="font-body text-gray-600 mb-6">Möchtest du dieses Medium wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>

          <div v-if="itemToDelete" class="flex items-center gap-4 mb-6">
            <img :src="mediaStore.getMediaUrl(itemToDelete)" :alt="itemToDelete.originalName" class="w-16 h-16 object-cover rounded-lg" />
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
              Löschen
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
          <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">Ordner löschen</h3>
          <p class="font-body text-gray-600 mb-6">
            Möchtest du den Ordner
            <strong>{{ folderToDelete?.name }}</strong> wirklich löschen? Alle Unterordner werden ebenfalls gelöscht. Medien in diesem Ordner werden
            in das Hauptverzeichnis verschoben.
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
              Löschen
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Move Media Modal -->
    <Teleport to="body">
      <div v-if="showMoveModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showMoveModal = false">
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">MEDIUM VERSCHIEBEN</h3>
          <p class="font-body text-gray-600 mb-4">
            Wohin möchtest du
            <strong>{{ itemToMove?.originalName }}</strong> verschieben?
          </p>

          <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-6">
            <button
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 flex items-center gap-3 transition-colors"
              @click="executeMove(null)"
            >
              <FontAwesomeIcon icon="house" class="text-gray-400" />
              <span class="font-body text-sm text-vsg-blue-900">Mediathek (Root)</span>
            </button>
            <button
              v-for="folder in mediaStore.folders.filter((f) => f.id !== mediaStore.currentFolderId)"
              :key="'move-to-' + folder.id"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-3 transition-colors"
              @click="executeMove(folder.id)"
            >
              <FontAwesomeIcon icon="folder" class="text-vsg-blue-400" />
              <span class="font-body text-sm text-vsg-blue-900">{{ folder.name }}</span>
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
