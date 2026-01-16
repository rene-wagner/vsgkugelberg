<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { ChronicleEntry } from '../types/history.types';

const props = defineProps<{
  entry: ChronicleEntry;
}>();

const emit = defineEmits<{
  (e: 'update', data: { year: string; description: string }): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'year' | 'description', value: string) {
  emit('update', {
    year: field === 'year' ? value : props.entry.year,
    description: field === 'description' ? value : props.entry.description,
  });
}
</script>

<template>
  <div class="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded-lg group">
    <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2">
      <FontAwesomeIcon icon="grip" />
    </div>

    <div class="flex-1 grid grid-cols-12 gap-3">
      <div class="col-span-3">
        <input
          :value="entry.year"
          type="text"
          placeholder="Jahr/Zeit"
          class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('year', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="col-span-9">
        <textarea
          :value="entry.description"
          placeholder="Ereignis Beschreibung"
          rows="3"
          class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('description', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </div>

    <button
      type="button"
      class="text-gray-400 hover:text-red-600 transition-colors mt-2"
      @click="emit('delete')"
    >
      <FontAwesomeIcon icon="trash" />
    </button>
  </div>
</template>
