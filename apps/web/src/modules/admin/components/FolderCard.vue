<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  folder: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}>();

const emit = defineEmits<{
  navigate: [id: number];
  delete: [folder: typeof props.folder];
}>();
</script>

<template>
  <div
    class="group relative bg-vsg-blue-50 border border-vsg-blue-100 rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-vsg-blue-100 transition-colors"
    @click="emit('navigate', folder.id)"
  >
    <FontAwesomeIcon
      icon="folder"
      size="2x"
      class="text-vsg-blue-900"
    />
    <span class="mt-2 font-body text-sm text-vsg-blue-900 font-medium px-2 text-center truncate w-full">
      {{ folder.name }}
    </span>

    <div
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      @click.stop
    >
      <button
        type="button"
        class="p-1.5 bg-white/80 rounded-md hover:bg-red-50 text-red-600 transition-colors"
        title="Ordner löschen"
        @click="emit('delete', folder)"
      >
        <FontAwesomeIcon icon="trash" />
      </button>
    </div>
  </div>
</template>
