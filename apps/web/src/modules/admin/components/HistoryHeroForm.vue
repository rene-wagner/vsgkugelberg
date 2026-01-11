<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHistoryStore } from '../stores/historyStore';
import type { HistoryContent } from '../types/history.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const heroHeadline = ref('');
const heroSubHeadline = ref('');

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      heroHeadline.value = newHistory.heroHeadline;
      heroSubHeadline.value = newHistory.heroSubHeadline;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await historyStore.updateHistory({
    heroHeadline: heroHeadline.value,
    heroSubHeadline: heroSubHeadline.value,
  });
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        HERO BEREICH
      </h2>

      <div class="space-y-6">
        <div>
          <label
            for="heroHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="heroHeadline"
            v-model="heroHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="heroSubHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Unterüberschrift
          </label>
          <VsgMarkdownEditor
            id="heroSubHeadline"
            v-model="heroSubHeadline"
            placeholder="Unterüberschrift der Historie..."
            min-height="150px"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="historyStore.isSaving"
      >
        {{ historyStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>
