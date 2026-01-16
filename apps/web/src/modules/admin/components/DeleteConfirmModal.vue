<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  message: string;
  item?: any;
  mediaUrl?: string;
}>();

const isOpen = ref(false);

watch(
  () => props.item,
  (item) => {
    if (item) {
      isOpen.value = true;
    } else {
      isOpen.value = false;
    }
  },
);

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="emit('cancel')"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">{{ props.item ? 'Medium löschen' : title }}</h3>
        <p class="font-body text-gray-600 mb-6">{{ message }}</p>

        <div
          v-if="props.item && mediaUrl"
          class="flex items-center gap-4 mb-6"
        >
          <img
            :src="mediaUrl"
            :alt="props.item.originalName"
            class="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <p class="font-body text-sm text-vsg-blue-900 font-medium">{{ props.item.originalName }}</p>
            <p class="font-body text-xs text-gray-500">{{ formatFileSize(props.item.size) }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
          @click="emit('cancel')"
        >
          Abbrechen
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-red-600 text-white font-body text-sm rounded-lg hover:bg-red-700 transition-colors"
          @click="emit('confirm')"
        >
          Löschen
        </button>
      </div>
    </div>
  </Teleport>
</template>
