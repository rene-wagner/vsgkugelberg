<script setup lang="ts">
import type { FestivalItem } from '../types/history.types';

const props = defineProps<{
  item: FestivalItem;
}>();

const emit = defineEmits<{
  (e: 'update', data: { headline: string; text: string }): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'headline' | 'text', value: string) {
  emit('update', {
    headline: field === 'headline' ? value : props.item.headline,
    text: field === 'text' ? value : props.item.text,
  });
}
</script>

<template>
  <div
    class="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group"
  >
    <div
      class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z" />
      </svg>
    </div>

    <div class="flex-1 space-y-3">
      <input
        :value="item.headline"
        type="text"
        placeholder="Überschrift (z.B. RADTOUREN)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 font-display tracking-widest focus:border-vsg-blue-600 outline-none"
        @input="
          handleInput('headline', ($event.target as HTMLInputElement).value)
        "
      />

      <textarea
        :value="item.text"
        placeholder="Beschreibung der Veranstaltung..."
        rows="4"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
        @input="
          handleInput('text', ($event.target as HTMLTextAreaElement).value)
        "
      ></textarea>
    </div>

    <button
      type="button"
      class="text-gray-400 hover:text-red-600 transition-colors mt-2"
      @click="emit('delete')"
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
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14"
        />
      </svg>
    </button>
  </div>
</template>
