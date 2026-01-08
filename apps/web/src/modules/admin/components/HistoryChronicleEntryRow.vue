<script setup lang="ts">
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
  <div
    class="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded-lg group"
  >
    <div
      class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" />
      </svg>
    </div>

    <div class="flex-1 grid grid-cols-12 gap-3">
      <div class="col-span-3">
        <input
          :value="entry.year"
          type="text"
          placeholder="Jahr/Zeit"
          class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="
            handleInput('year', ($event.target as HTMLInputElement).value)
          "
        />
      </div>
      <div class="col-span-9">
        <textarea
          :value="entry.description"
          placeholder="Ereignis Beschreibung"
          rows="3"
          class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="
            handleInput(
              'description',
              ($event.target as HTMLTextAreaElement).value,
            )
          "
        ></textarea>
      </div>
    </div>

    <button
      type="button"
      class="text-gray-400 hover:text-red-600 transition-colors mt-2"
      @click="emit('delete')"
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
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14"
        />
      </svg>
    </button>
  </div>
</template>
