<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaStore, type MediaItem } from '../stores/mediaStore';
import MediaSelectionModal from './MediaSelectionModal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = withDefaults(
  defineProps<{
    mediaId: number | null;
    media: MediaItem | null;
    label?: string;
    aspectRatio?: string;
  }>(),
  {
    label: 'Bild auswählen',
    aspectRatio: 'aspect-video',
  },
);

const emit = defineEmits<{
  (e: 'update:mediaId', value: number | null): void;
  (e: 'update:media', value: MediaItem | null): void;
}>();

const mediaStore = useMediaStore();
const isModalOpen = ref(false);
const isUploading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const hasMedia = computed(() => props.media !== null);

const mediaUrl = computed(() => {
  if (props.media) {
    return mediaStore.getMediaUrl(props.media);
  }
  return undefined;
});

function openMediaLibrary() {
  isModalOpen.value = true;
}

function closeMediaLibrary() {
  isModalOpen.value = false;
}

function handleMediaSelect(media: MediaItem) {
  emit('update:mediaId', media.id);
  emit('update:media', media);
}

function clearMedia() {
  emit('update:mediaId', null);
  emit('update:media', null);
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    alert('Nur Bilder (JPG, PNG, WebP, SVG) sind erlaubt.');
    return;
  }

  isUploading.value = true;

  try {
    const uploadedMedia = await mediaStore.uploadMedia(file);
    if (uploadedMedia) {
      emit('update:mediaId', uploadedMedia.id);
      emit('update:media', uploadedMedia);
    }
  } catch {
    alert('Fehler beim Hochladen des Bildes.');
  } finally {
    isUploading.value = false;
    // Reset input
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
}
</script>

<template>
  <div class="image-selector">
    <!-- Empty State -->
    <div
      v-if="!hasMedia"
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
    >
      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FontAwesomeIcon
          icon="image"
          class="text-gray-400"
        />
      </div>
      <p class="font-body text-sm text-gray-500 mb-4">
        {{ label }}
      </p>
      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
          @click="openMediaLibrary"
        >
          Mediathek öffnen
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="isUploading"
          @click="triggerFileUpload"
        >
          {{ isUploading ? 'Hochladen...' : 'Bild hochladen' }}
        </button>
      </div>
    </div>

    <!-- Image Preview -->
    <div
      v-else
      class="relative group bg-gray-100 rounded-lg overflow-hidden"
      :class="aspectRatio"
    >
      <img
        :src="mediaUrl"
        :alt="media?.originalName || 'Bild'"
        class="w-full h-full object-cover"
      />

      <!-- Overlay with Actions -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button
          type="button"
          class="px-4 py-2 bg-white text-gray-700 font-body text-sm rounded-lg hover:bg-gray-100 transition-colors"
          @click="openMediaLibrary"
        >
          Ändern
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-red-600 text-white font-body text-sm rounded-lg hover:bg-red-700 transition-colors"
          @click="clearMedia"
        >
          Entfernen
        </button>
      </div>

      <!-- File Info -->
      <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
        <p class="font-body text-xs text-white truncate">
          {{ media?.originalName }}
        </p>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/svg+xml"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Media Selection Modal -->
    <MediaSelectionModal
      :is-open="isModalOpen"
      @close="closeMediaLibrary"
      @select="handleMediaSelect"
    />
  </div>
</template>
