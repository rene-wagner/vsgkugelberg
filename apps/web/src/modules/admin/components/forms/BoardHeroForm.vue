<script setup lang="ts">
import { ref, watch } from 'vue';
import { useBoardContentStore } from '../../stores/boardContentStore';
import type { BoardContent } from '../../types/board-content.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const props = defineProps<{
  boardContent: BoardContent;
}>();

const boardContentStore = useBoardContentStore();

const headline = ref('');
const description = ref('');

watch(
  () => props.boardContent,
  (newContent) => {
    if (newContent) {
      headline.value = newContent.headline;
      description.value = newContent.description;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await boardContentStore.updateBoardContent({
    headline: headline.value,
    description: description.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Hero Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="headline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="headline"
            v-model="headline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="description"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung
          </label>
          <VsgMarkdownEditor
            id="description"
            v-model="description"
            placeholder="Beschreibung des Vorstands..."
            min-height="150px"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="boardContentStore.isSaving"
      >
        {{ boardContentStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>
