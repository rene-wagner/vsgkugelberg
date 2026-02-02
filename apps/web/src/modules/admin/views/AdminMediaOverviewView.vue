<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useMediaStore } from '../stores/mediaStore';
import type { RegenerateThumbnailsResult } from '../stores/mediaStore';
import MediaUploadZone from '../components/MediaUploadZone.vue';
import MediaGallery from '../components/MediaGallery.vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { VsgAlert } from '@/shared/components';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

const mediaStore = useMediaStore();

const showRegenerateConfirm = ref(false);
const regenerateResult = ref<RegenerateThumbnailsResult | null>(null);
const showNewFolderModal = ref(false);
const newFolderName = ref('');
const breadcrumbs = ref<{ id: number | null; name: string }[]>([{ id: null, name: 'Mediathek' }]);

onMounted(() => {
  loadContent();
});

async function loadContent(folderId: number | null = mediaStore.currentFolderId) {
  const promises: Promise<any>[] = [mediaStore.fetchMedia(1, 48, folderId), mediaStore.fetchFolders(folderId)];

  if (folderId !== null) {
    promises.push(mediaStore.fetchFolderDetails(folderId));
  } else {
    mediaStore.currentFolder = null;
  }

  await Promise.all(promises);

  // Update breadcrumbs
  if (folderId === null) {
    breadcrumbs.value = [{ id: null, name: 'Mediathek' }];
  } else if (mediaStore.currentFolder) {
    // For now we still only show Root > Current
    // If the API supported getting the full path, we would use it here.
    breadcrumbs.value = [
      { id: null, name: 'Mediathek' },
      { id: mediaStore.currentFolder.id, name: mediaStore.currentFolder.name },
    ];
  }
}

const mediaCount = computed(() => mediaStore.media.length);
const totalCount = computed(() => mediaStore.meta?.total ?? 0);

async function navigateToFolder(folderId: number | null) {
  await loadContent(folderId);
}

async function handleCreateFolder() {
  if (!newFolderName.value.trim()) return;

  const folder = await mediaStore.createFolder(newFolderName.value.trim());
  if (folder) {
    newFolderName.value = '';
    showNewFolderModal.value = false;
  }
}

async function navigateUp() {
  const parentId = mediaStore.currentFolder?.parentId || null;
  await navigateToFolder(parentId);
}

function handleUploadComplete() {
  // Gallery will update automatically via reactive store state
}

function openRegenerateConfirm() {
  showRegenerateConfirm.value = true;
  regenerateResult.value = null;
}

function closeRegenerateConfirm() {
  showRegenerateConfirm.value = false;
  regenerateResult.value = null;
}

async function executeRegenerateAll() {
  const result = await mediaStore.regenerateAllThumbnails();
  if (result) {
    regenerateResult.value = result;
  }
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="MEDIATHEK"
      description="Verwalte Bilder und Medien"
    />

    <!-- Upload Zone -->
    <div class="mb-8">
      <MediaUploadZone @upload-complete="handleUploadComplete" />
    </div>

    <!-- Breadcrumbs & Actions -->
    <div class="flex items-center justify-between mb-6">
      <nav class="flex items-center gap-2 text-sm font-body">
        <template
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
        >
          <button
            type="button"
            class="hover:text-vsg-blue-900 transition-colors"
            :class="index === breadcrumbs.length - 1 ? 'text-vsg-blue-900 font-medium' : 'text-vsg-blue-500'"
            @click="navigateToFolder(crumb.id)"
          >
            {{ crumb.name }}
          </button>
          <span
            v-if="index < breadcrumbs.length - 1"
            class="text-vsg-blue-300"
            >/</span
          >
        </template>
      </nav>

      <div class="flex items-center gap-3">
        <button
          v-if="mediaStore.currentFolderId !== null"
          type="button"
          class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          @click="navigateUp"
        >
          <FontAwesomeIcon icon="arrow-left" />
          Ebene nach oben
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-vsg-blue-200 text-vsg-blue-700 font-body text-sm rounded-lg hover:bg-vsg-blue-50 transition-colors flex items-center gap-2"
          @click="showNewFolderModal = true"
        >
          <FontAwesomeIcon icon="folder-plus" />
          Neuer Ordner
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <AdminLoadingState v-if="mediaStore.isLoading && mediaStore.media.length === 0" />

    <!-- Error State -->
    <VsgAlert
      v-else-if="mediaStore.error"
      variant="error"
      :message="mediaStore.error"
      dismissible
      class="mb-6"
      @dismiss="mediaStore.clearError()"
    />

    <!-- Gallery Section -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl tracking-wider text-vsg-blue-900">GALERIE</h2>
        <div class="flex items-center gap-4">
          <span class="font-body text-sm text-gray-500"> {{ mediaCount }} von {{ totalCount }} Medien </span>
          <button
            type="button"
            class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors flex items-center gap-2"
            :disabled="mediaStore.isRegenerating || mediaCount === 0"
            :class="{
              'opacity-50 cursor-not-allowed': mediaStore.isRegenerating || mediaCount === 0,
            }"
            @click="openRegenerateConfirm"
          >
            <FontAwesomeIcon icon="arrows-rotate" />
            Alle Thumbnails regenerieren
          </button>
        </div>
      </div>

      <MediaGallery />
    </div>

    <!-- Regenerate All Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showRegenerateConfirm"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="closeRegenerateConfirm"
      >
        <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">THUMBNAILS REGENERIEREN</h3>

          <!-- Confirmation State -->
          <div v-if="!mediaStore.isRegenerating && !regenerateResult">
            <p class="font-body text-gray-600 mb-6">
              Möchtest du die Thumbnails für alle {{ totalCount }} Medien neu generieren? Dieser Vorgang kann einige Zeit dauern.
            </p>
            <p class="font-body text-sm text-gray-500 mb-6">SVG-Dateien werden übersprungen, da sie keine Thumbnails benötigen.</p>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
                @click="closeRegenerateConfirm"
              >
                Abbrechen
              </button>
              <button
                type="button"
                class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
                @click="executeRegenerateAll"
              >
                Regenerieren
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <AdminLoadingState
            v-else-if="mediaStore.isRegenerating"
            padding="py-8"
            message="Thumbnails werden regeneriert..."
            hint="Bitte warten, dies kann einige Zeit dauern."
          />

          <!-- Result State -->
          <div v-else-if="regenerateResult">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-2 mb-2">
                <FontAwesomeIcon
                  icon="check"
                  class="text-green-600"
                />
                <span class="font-body font-medium text-green-800"> Regenerierung abgeschlossen </span>
              </div>
              <div class="font-body text-sm text-green-700 space-y-1">
                <p>Verarbeitet: {{ regenerateResult.processed }}</p>
                <p>Erfolgreich: {{ regenerateResult.succeeded }}</p>
                <p
                  v-if="regenerateResult.failed > 0"
                  class="text-red-600"
                >
                  Fehlgeschlagen: {{ regenerateResult.failed }}
                </p>
                <p v-if="regenerateResult.skipped > 0">Ubersprungen (SVG): {{ regenerateResult.skipped }}</p>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
                @click="closeRegenerateConfirm"
              >
                Schliessen
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- New Folder Modal -->
    <Teleport to="body">
      <div
        v-if="showNewFolderModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showNewFolderModal = false"
      >
        <div class="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
          <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">NEUER ORDNER</h3>
          <div class="mb-6">
            <VsgInput
              v-model="newFolderName"
              id="new-folder-name"
              type="text"
              label="Name"
              placeholder="z.B. Veranstaltungen"
              variant="compact"
              @keyup.enter="handleCreateFolder"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
              @click="showNewFolderModal = false"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
              :disabled="!newFolderName.trim() || mediaStore.isLoading"
              @click="handleCreateFolder"
            >
              Erstellen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
