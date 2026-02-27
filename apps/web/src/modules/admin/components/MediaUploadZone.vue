<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMediaStore } from '../stores/mediaStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const emit = defineEmits<{
  (e: 'upload-complete'): void;
}>();

const mediaStore = useMediaStore();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];

const uploadItems = computed(() => {
  return Array.from(mediaStore.uploadProgress.values());
});

function handleDragEnter(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const files = event.dataTransfer?.files;
  if (files) {
    await processFiles(Array.from(files));
  }
}

function handleClick() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    await processFiles(Array.from(input.files));
    input.value = ''; // Reset to allow selecting the same file again
  }
}

async function processFiles(files: File[]) {
  const validFiles = files.filter((file) => allowedTypes.includes(file.type));

  if (validFiles.length < files.length) {
    const invalidCount = files.length - validFiles.length;
    alert(`${invalidCount} Datei(en) wurden ignoriert. Erlaubte Formate: JPG, PNG, WebP, SVG, PDF`);
  }

  if (validFiles.length > 0) {
    await mediaStore.uploadMultipleMedia(validFiles);
    emit('upload-complete');
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
      :class="[isDragging ? 'border-vsg-blue-500 bg-vsg-blue-50' : 'border-gray-300 hover:border-vsg-blue-400 hover:bg-gray-50']"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="handleClick"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
        multiple
        @change="handleFileChange"
      />

      <div class="flex flex-col items-center gap-3">
        <!-- Upload Icon -->
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="isDragging ? 'bg-vsg-blue-100' : 'bg-gray-100'"
        >
          <FontAwesomeIcon
            icon="upload"
            size="2x"
            :class="isDragging ? 'text-vsg-blue-600' : 'text-gray-400'"
          />
        </div>

        <!-- Text -->
        <div>
          <p
            class="font-body text-sm"
            :class="isDragging ? 'text-vsg-blue-600' : 'text-gray-600'"
          >
            <span v-if="isDragging">Dateien hier ablegen</span>
            <span v-else>
              Dateien hierher ziehen oder
              <span class="text-vsg-blue-600 font-medium">klicken</span>
            </span>
          </p>
          <p class="font-body text-xs text-gray-400 mt-1">JPG, PNG, WebP, SVG, PDF (max. 10MB)</p>
        </div>
      </div>
    </div>

    <!-- Upload Progress List -->
    <div
      v-if="uploadItems.length > 0"
      class="space-y-2"
    >
      <div
        v-for="item in uploadItems"
        :key="item.filename"
        class="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3"
      >
        <!-- Status Icon -->
        <div class="shrink-0">
          <FontAwesomeIcon
            v-if="item.status === 'complete'"
            icon="check"
            class="text-green-500"
          />
          <FontAwesomeIcon
            v-else-if="item.status === 'error'"
            icon="xmark"
            class="text-red-500"
          />
          <FontAwesomeIcon
            v-else
            icon="spinner"
            class="text-gray-500"
          />
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <p class="font-body text-sm text-vsg-blue-900 truncate">
            {{ item.filename }}
          </p>
          <p
            v-if="item.status === 'error'"
            class="font-body text-xs text-red-500"
          >
            {{ item.error }}
          </p>
        </div>

        <!-- Progress -->
        <div
          v-if="item.status === 'uploading'"
          class="shrink-0 w-16 text-right"
        >
          <span class="font-body text-xs text-gray-500">{{ item.progress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
