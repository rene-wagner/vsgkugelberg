<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useMediaStore } from '../stores/mediaStore';
import MediaUploadZone from '../components/MediaUploadZone.vue';
import MediaGallery from '../components/MediaGallery.vue';

const mediaStore = useMediaStore();

onMounted(() => {
  mediaStore.fetchMedia();
});

function handleUploadComplete() {
  // Gallery will update automatically via reactive store state
}

const mediaCount = computed(() => mediaStore.media.length);
const totalCount = computed(() => mediaStore.meta?.total ?? 0);
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
        <span class="font-body text-sm text-gray-500">
          {{ mediaCount }} von {{ totalCount }} Medien
        </span>
      </div>

      <MediaGallery />
    </div>
  </div>
</template>
