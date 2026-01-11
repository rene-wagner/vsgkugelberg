<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMediaStore, type MediaItem } from '../stores/mediaStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  modelValue: number | null;
  currentImage: MediaItem | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const mediaStore = useMediaStore();

const showGallery = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewImage = ref<MediaItem | null>(null);

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

const hasContent = computed(() => mediaStore.media.length > 0 || mediaStore.folders.length > 0);

// Filter media to show only allowed image types (JPEG, PNG, WebP)
const imageMedia = computed(() => {
  return mediaStore.media.filter((item) => ALLOWED_MIMETYPES.includes(item.mimetype));
});

// Watch for currentImage prop to set the preview
watch(
  () => props.currentImage,
  (image) => {
    if (image) {
      previewImage.value = image;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // We load root by default if opening gallery
});

async function openGallery() {
  await loadFolder(null);
  showGallery.value = true;
}

async function loadFolder(folderId: number | null) {
  const promises: Promise<any>[] = [mediaStore.fetchMedia(1, 100, folderId), mediaStore.fetchFolders(folderId)];

  if (folderId !== null) {
    promises.push(mediaStore.fetchFolderDetails(folderId));
  } else {
    mediaStore.currentFolder = null;
  }

  await Promise.all(promises);
}

async function navigateUp() {
  const parentId = mediaStore.currentFolder?.parentId || null;
  await loadFolder(parentId);
}

function closeGallery() {
  showGallery.value = false;
}

function selectImage(item: MediaItem) {
  previewImage.value = item;
  emit('update:modelValue', item.id);
  closeGallery();
}

function clearImage() {
  previewImage.value = null;
  emit('update:modelValue', null);
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  // Validate image type
  if (!ALLOWED_MIMETYPES.includes(file.type)) {
    alert('Bitte nur JPEG, PNG oder WebP Bilder hochladen.');
    input.value = '';
    return;
  }

  isUploading.value = true;
  try {
    const result = await mediaStore.uploadMedia(file);
    if (result) {
      selectImage(result);
    }
  } finally {
    isUploading.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div>
    <!-- Current Image Preview / Placeholder -->
    <div class="flex items-start gap-4">
      <!-- Image Display Area (Circular for profile images) -->
      <div
        class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 overflow-hidden"
        :class="{ 'border-solid border-vsg-blue-300': previewImage }"
      >
        <img v-if="previewImage" :src="mediaStore.getMediaUrl(previewImage)" :alt="previewImage.originalName" class="w-full h-full object-cover" />
        <FontAwesomeIcon v-else icon="user" class="text-gray-400" />
      </div>

      <!-- Actions -->
      <div class="flex-1 space-y-2">
        <p class="font-body text-sm text-gray-600">
          {{ previewImage ? previewImage.originalName : 'Kein Bild ausgewählt' }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-body text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="openGallery"
          >
            Aus Mediathek wählen
          </button>

          <button
            type="button"
            class="px-3 py-1.5 text-xs font-body text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            :disabled="isUploading"
            @click="triggerUpload"
          >
            {{ isUploading ? 'Hochladen...' : 'Bild hochladen' }}
          </button>

          <button
            v-if="previewImage"
            type="button"
            class="px-3 py-1.5 text-xs font-body text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            @click="clearImage"
          >
            Entfernen
          </button>
        </div>

        <p class="font-body text-xs text-gray-400">Erlaubte Formate: JPEG, PNG, WebP</p>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input ref="fileInput" type="file" class="hidden" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" @change="handleFileUpload" />

    <!-- Gallery Modal -->
    <Teleport to="body">
      <div v-if="showGallery" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="closeGallery">
        <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Profilbild wählen</h3>
            <button type="button" class="p-1 text-gray-400 hover:text-gray-600 transition-colors" @click="closeGallery">
              <FontAwesomeIcon icon="xmark" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Back button if in folder -->
            <div v-if="mediaStore.currentFolderId !== null" class="mb-4">
              <button
                type="button"
                class="flex items-center gap-2 text-sm font-body text-vsg-blue-600 hover:text-vsg-blue-800 transition-colors"
                @click="navigateUp"
              >
                <FontAwesomeIcon icon="arrow-left" />
                Eine Ebene nach oben
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="!hasContent" class="text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon="image" class="w-8 h-8 text-gray-400" />
              </div>
              <p class="font-body text-gray-500">Keine passenden Bilder in der Mediathek.</p>
              <button
                type="button"
                class="mt-4 px-4 py-2 text-sm font-body bg-vsg-blue-600 text-white rounded-lg hover:bg-vsg-blue-700 transition-colors"
                @click="triggerUpload"
              >
                Bild hochladen
              </button>
            </div>

            <!-- Image Grid -->
            <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <!-- Back to parent -->
              <button
                v-if="mediaStore.currentFolderId !== null"
                type="button"
                class="aspect-square bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors"
                @click="navigateUp"
              >
                <FontAwesomeIcon icon="arrow-left" class="text-gray-400" />
              </button>

              <!-- Folders -->
              <button
                v-for="folder in mediaStore.folders"
                :key="'folder-' + folder.id"
                type="button"
                class="aspect-square bg-vsg-blue-50 border border-vsg-blue-100 rounded-lg flex flex-col items-center justify-center hover:bg-vsg-blue-100 transition-colors"
                @click="loadFolder(folder.id)"
              >
                <FontAwesomeIcon icon="folder" class="text-vsg-blue-400" />
                <span class="mt-1 font-body text-[10px] text-vsg-blue-900 font-medium px-1 text-center truncate w-full">
                  {{ folder.name }}
                </span>
              </button>

              <!-- Images -->
              <button
                v-for="item in imageMedia"
                :key="item.id"
                type="button"
                class="aspect-square border-2 rounded-lg overflow-hidden transition-all hover:border-vsg-blue-400 hover:ring-2 hover:ring-vsg-blue-100"
                :class="[modelValue === item.id ? 'border-vsg-blue-600 ring-2 ring-vsg-blue-100' : 'border-gray-200']"
                :title="item.originalName"
                @click="selectImage(item)"
              >
                <img :src="mediaStore.getMediaUrl(item)" :alt="item.originalName" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-body border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeGallery"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
