<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  folders: {
    id: number;
    name: string;
  }[];
  currentFolderId: number | null;
  item: {
    id: number;
    originalName: string;
  } | null;
}>();

const emit = defineEmits<{
  confirm: [targetFolderId: number | null];
  cancel: [];
}>();
</script>

<template>
  <Teleport
    to="body"
    v-if="item"
  >
    <div
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="emit('cancel')"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 class="font-display text-lg tracking-wider text-vsg-blue-900 mb-4">MEDIUM VERSCHIEBEN</h3>
        <p class="font-body text-gray-600 mb-4">
          Wohin möchtest du <strong>{{ item.originalName }}</strong> verschieben?
        </p>

        <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg mb-6">
          <button
            type="button"
            class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 flex items-center gap-3 transition-colors"
            @click="emit('confirm', null)"
          >
            <FontAwesomeIcon
              icon="house"
              class="text-gray-400"
            />
            <span class="font-body text-sm text-vsg-blue-900">Mediathek (Root)</span>
          </button>
          <button
            v-for="folder in folders.filter((f) => f.id !== currentFolderId)"
            :key="'move-to-' + folder.id"
            type="button"
            class="w-full text-left px-4 py-3 hover:bg-vsg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-3 transition-colors"
            @click="emit('confirm', folder.id)"
          >
            <FontAwesomeIcon
              icon="folder"
              class="text-vsg-blue-400"
            />
            <span class="font-body text-sm text-vsg-blue-900">{{ folder.name }}</span>
          </button>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
            @click="emit('cancel')"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
