<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaStore, type MediaItem, type MediaFolder } from '../stores/mediaStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import MediaGalleryItem from './MediaGalleryItem.vue';
import FolderCard from './FolderCard.vue';
import MediaPreviewModal from './modals/MediaPreviewModal.vue';
import DeleteConfirmModal from './modals/DeleteConfirmModal.vue';
import MoveMediaModal from './modals/MoveMediaModal.vue';

const mediaStore = useMediaStore();

const copiedId = ref<number | null>(null);
const regeneratingId = ref<number | null>(null);
const regeneratedId = ref<number | null>(null);

const previewItem = ref<MediaItem | null>(null);
const itemToDelete = ref<MediaItem | null>(null);
const folderToDelete = ref<MediaFolder | null>(null);
const itemToMove = ref<MediaItem | null>(null);

const hasContent = computed(() => mediaStore.media.length > 0 || mediaStore.folders.length > 0);

function navigateToFolder(folderId: number | null) {
  mediaStore.fetchMedia(1, 48, folderId);
  mediaStore.fetchFolders(folderId);
}

function navigateUp() {
  const parentId = mediaStore.currentFolder?.parentId || null;
  navigateToFolder(parentId);
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

async function handleDelete(item: MediaItem) {
  await mediaStore.deleteMedia(item.id);
  itemToDelete.value = null;
}

async function handleDeleteFolder(folder: MediaFolder) {
  await mediaStore.deleteFolder(folder.id);
  folderToDelete.value = null;
}

function confirmDelete(item: MediaItem) {
  itemToDelete.value = item;
}

function confirmDeleteFolder(folder: MediaFolder) {
  folderToDelete.value = folder;
}

function openMoveModal(item: MediaItem) {
  itemToMove.value = item;
}

async function handleMove(targetFolderId: number | null) {
  const item = itemToMove.value;
  if (item) {
    await mediaStore.moveMedia(item.id, targetFolderId);
  }
  itemToMove.value = null;
}
</script>

<template>
  <div>
    <div
      v-if="!hasContent"
      class="text-center py-12"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FontAwesomeIcon
          icon="image"
          size="2x"
          class="text-gray-400"
        />
      </div>
      <p class="font-body text-gray-500">Noch keine Medien oder Ordner vorhanden.</p>
      <p class="font-body text-sm text-gray-400 mt-1">Nutze die Upload-Zone oder "Neuer Ordner", um Inhalte hinzuzufügen.</p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      <div
        v-if="mediaStore.currentFolderId !== null"
        class="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
        @click="navigateUp"
      >
        <FontAwesomeIcon
          icon="arrow-left"
          size="2x"
          class="text-gray-400"
        />
      </div>

      <FolderCard
        v-for="folder in mediaStore.folders"
        :key="'folder-' + folder.id"
        :folder="folder"
        @navigate="navigateToFolder"
        @delete="confirmDeleteFolder"
      />

      <MediaGalleryItem
        v-for="item in mediaStore.media"
        :key="item.id"
        :item="item"
        :media-url="mediaStore.getMediaUrl(item)"
        :has-thumbnails="mediaStore.hasThumbnails(item)"
        :can-have-thumbnails="mediaStore.canHaveThumbnails(item)"
        :copied-id="copiedId"
        :regenerating-id="regeneratingId"
        :regenerated-id="regeneratedId"
        @preview="(item) => (previewItem = item)"
        @move="openMoveModal"
        @copy-url="copyUrl"
        @regenerate="regenerateThumbnails"
        @delete="confirmDelete"
      />
    </div>

    <MediaPreviewModal
      :item="previewItem"
      :media-url="previewItem ? mediaStore.getMediaUrl(previewItem) : ''"
      :has-thumbnails="previewItem ? mediaStore.hasThumbnails(previewItem) : false"
      :can-have-thumbnails="previewItem ? mediaStore.canHaveThumbnails(previewItem) : false"
      @close="() => (previewItem = null)"
    />

    <DeleteConfirmModal
      title="Medium löschen"
      message="Möchtest du dieses Medium wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      :item="itemToDelete"
      :media-url="itemToDelete ? mediaStore.getMediaUrl(itemToDelete) : ''"
      @confirm="
        () => {
          if (itemToDelete) handleDelete(itemToDelete);
        }
      "
      @cancel="() => (itemToDelete = null)"
    />

    <DeleteConfirmModal
      title="Ordner löschen"
      :message="
        folderToDelete
          ? `Möchtest du den Ordner ${folderToDelete.name} wirklich löschen? Alle Unterordner werden ebenfalls gelöscht. Medien in diesem Ordner werden in das Hauptverzeichnis verschoben.`
          : ''
      "
      :item="folderToDelete ? { id: folderToDelete.id, originalName: folderToDelete.name, filename: '', size: 0, mimetype: '' } : null"
      :media-url="''"
      @confirm="
        () => {
          if (folderToDelete) handleDeleteFolder(folderToDelete);
        }
      "
      @cancel="() => (folderToDelete = null)"
    />

    <MoveMediaModal
      v-if="itemToMove"
      :item="itemToMove"
      :folders="mediaStore.folders"
      :current-folder-id="mediaStore.currentFolderId"
      @confirm="handleMove"
      @cancel="() => (itemToMove = null)"
    />
  </div>
</template>
