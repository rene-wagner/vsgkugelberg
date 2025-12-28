<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMediaStore, type MediaItem } from '../stores/mediaStore';

const props = defineProps<{
  modelValue: number | null;
  currentIcon: MediaItem | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const mediaStore = useMediaStore();

const showGallery = ref(false);
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewIcon = ref<MediaItem | null>(null);

// Filter media to show only SVG files
const svgMedia = computed(() => {
  return mediaStore.media.filter((item) => item.mimetype === 'image/svg+xml');
});

// Watch for currentIcon prop to set the preview
watch(
  () => props.currentIcon,
  (icon) => {
    if (icon) {
      previewIcon.value = icon;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // Fetch media to populate the gallery
  if (mediaStore.media.length === 0) {
    await mediaStore.fetchMedia(1, 100);
  }
});

function openGallery() {
  showGallery.value = true;
}

function closeGallery() {
  showGallery.value = false;
}

function selectIcon(item: MediaItem) {
  previewIcon.value = item;
  emit('update:modelValue', item.id);
  closeGallery();
}

function clearIcon() {
  previewIcon.value = null;
  emit('update:modelValue', null);
}

function triggerUpload() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  // Validate SVG
  if (file.type !== 'image/svg+xml') {
    alert('Bitte nur SVG-Dateien hochladen.');
    input.value = '';
    return;
  }

  isUploading.value = true;
  try {
    const result = await mediaStore.uploadMedia(file);
    if (result) {
      selectIcon(result);
    }
  } finally {
    isUploading.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div>
    <!-- Current Icon Preview / Placeholder -->
    <div class="flex items-start gap-4">
      <!-- Icon Display Area -->
      <div
        class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"
        :class="{ 'border-solid border-vsg-blue-300': previewIcon }"
      >
        <img
          v-if="previewIcon"
          :src="mediaStore.getMediaUrl(previewIcon)"
          :alt="previewIcon.originalName"
          class="w-16 h-16 object-contain"
        />
        <svg
          v-else
          class="w-8 h-8 text-gray-300"
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

      <!-- Actions -->
      <div class="flex-1 space-y-2">
        <p class="font-body text-sm text-gray-600">
          {{ previewIcon ? previewIcon.originalName : 'Kein Icon ausgewahlt' }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-body text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="openGallery"
          >
            Aus Mediathek wahlen
          </button>

          <button
            type="button"
            class="px-3 py-1.5 text-xs font-body text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            :disabled="isUploading"
            @click="triggerUpload"
          >
            {{ isUploading ? 'Hochladen...' : 'SVG hochladen' }}
          </button>

          <button
            v-if="previewIcon"
            type="button"
            class="px-3 py-1.5 text-xs font-body text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            @click="clearIcon"
          >
            Entfernen
          </button>
        </div>

        <p class="font-body text-xs text-gray-400">Nur SVG-Dateien erlaubt</p>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept=".svg,image/svg+xml"
      @change="handleFileUpload"
    />

    <!-- Gallery Modal -->
    <Teleport to="body">
      <div
        v-if="showGallery"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="closeGallery"
      >
        <div
          class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
          >
            <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">
              SVG-ICON WAHLEN
            </h3>
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeGallery"
            >
              <svg
                class="w-5 h-5"
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
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Empty State -->
            <div v-if="svgMedia.length === 0" class="text-center py-12">
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
                Keine SVG-Dateien in der Mediathek.
              </p>
              <button
                type="button"
                class="mt-4 px-4 py-2 text-sm font-body bg-vsg-blue-600 text-white rounded-lg hover:bg-vsg-blue-700 transition-colors"
                @click="triggerUpload"
              >
                SVG hochladen
              </button>
            </div>

            <!-- SVG Grid -->
            <div
              v-else
              class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
            >
              <button
                v-for="item in svgMedia"
                :key="item.id"
                type="button"
                class="aspect-square border-2 rounded-lg p-2 flex items-center justify-center transition-all hover:border-vsg-blue-400 hover:bg-vsg-blue-50"
                :class="[
                  modelValue === item.id
                    ? 'border-vsg-blue-600 bg-vsg-blue-50'
                    : 'border-gray-200 bg-white',
                ]"
                :title="item.originalName"
                @click="selectIcon(item)"
              >
                <img
                  :src="mediaStore.getMediaUrl(item)"
                  :alt="item.originalName"
                  class="w-full h-full object-contain"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3"
          >
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
