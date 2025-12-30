<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useMediaStore } from '../stores/mediaStore';
import type { RegenerateThumbnailsResult } from '../stores/mediaStore';
import MediaUploadZone from '../components/MediaUploadZone.vue';
import MediaGallery from '../components/MediaGallery.vue';

const mediaStore = useMediaStore();

const showRegenerateConfirm = ref(false);
const regenerateResult = ref<RegenerateThumbnailsResult | null>(null);

onMounted(() => {
  mediaStore.fetchMedia();
});

function handleUploadComplete() {
  // Gallery will update automatically via reactive store state
}

const mediaCount = computed(() => mediaStore.media.length);
const totalCount = computed(() => mediaStore.meta?.total ?? 0);

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
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        MEDIATHEK
      </h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">
        Verwalte Bilder und Medien
      </p>
    </div>

    <!-- Upload Zone -->
    <div class="mb-8">
      <MediaUploadZone @upload-complete="handleUploadComplete" />
    </div>

    <!-- Loading State -->
    <div
      v-if="mediaStore.isLoading && mediaStore.media.length === 0"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="mediaStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ mediaStore.error }}</p>
      <button
        type="button"
        class="mt-3 text-sm text-red-700 underline hover:no-underline"
        @click="mediaStore.clearError()"
      >
        Schliessen
      </button>
    </div>

    <!-- Gallery Section -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-xl tracking-wider text-vsg-blue-900">
          GALERIE
        </h2>
        <div class="flex items-center gap-4">
          <span class="font-body text-sm text-gray-500">
            {{ mediaCount }} von {{ totalCount }} Medien
          </span>
          <button
            type="button"
            class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors flex items-center gap-2"
            :disabled="mediaStore.isRegenerating || mediaCount === 0"
            :class="{
              'opacity-50 cursor-not-allowed':
                mediaStore.isRegenerating || mediaCount === 0,
            }"
            @click="openRegenerateConfirm"
          >
            <svg
              class="w-4 h-4"
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
          <h3
            class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4"
          >
            THUMBNAILS REGENERIEREN
          </h3>

          <!-- Confirmation State -->
          <div v-if="!mediaStore.isRegenerating && !regenerateResult">
            <p class="font-body text-gray-600 mb-6">
              Mochtest du die Thumbnails fur alle {{ totalCount }} Medien neu
              generieren? Dieser Vorgang kann einige Zeit dauern.
            </p>
            <p class="font-body text-sm text-gray-500 mb-6">
              SVG-Dateien werden ubersprungen, da sie keine Thumbnails
              benotigen.
            </p>

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
          <div v-else-if="mediaStore.isRegenerating" class="text-center py-8">
            <div
              class="w-12 h-12 border-4 border-vsg-blue-200 border-t-vsg-blue-600 rounded-full animate-spin mx-auto mb-4"
            ></div>
            <p class="font-body text-gray-600">
              Thumbnails werden regeneriert...
            </p>
            <p class="font-body text-sm text-gray-500 mt-2">
              Bitte warten, dies kann einige Zeit dauern.
            </p>
          </div>

          <!-- Result State -->
          <div v-else-if="regenerateResult">
            <div
              class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-5 h-5 text-green-600"
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
                <span class="font-body font-medium text-green-800">
                  Regenerierung abgeschlossen
                </span>
              </div>
              <div class="font-body text-sm text-green-700 space-y-1">
                <p>Verarbeitet: {{ regenerateResult.processed }}</p>
                <p>Erfolgreich: {{ regenerateResult.succeeded }}</p>
                <p v-if="regenerateResult.failed > 0" class="text-red-600">
                  Fehlgeschlagen: {{ regenerateResult.failed }}
                </p>
                <p v-if="regenerateResult.skipped > 0">
                  Ubersprungen (SVG): {{ regenerateResult.skipped }}
                </p>
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
  </div>
</template>
