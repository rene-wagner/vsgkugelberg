<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHistoryStore } from '../../stores/historyStore';
import AdminButton from '../AdminButton.vue';
import type { HistoryContent } from '../../types/history.types';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const ctaHeadline = ref('');
const ctaDescription = ref('');

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      ctaHeadline.value = newHistory.ctaHeadline;
      ctaDescription.value = newHistory.ctaDescription;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await historyStore.updateHistory({
    ctaHeadline: ctaHeadline.value,
    ctaDescription: ctaDescription.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Call to Action (CTA) Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="ctaHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="ctaHeadline"
            v-model="ctaHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="ctaDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibungstext
          </label>
          <textarea
            id="ctaDescription"
            v-model="ctaDescription"
            rows="6"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <AdminButton
        type="submit"
        size="large"
        :disabled="historyStore.isSaving"
        :loading="historyStore.isSaving"
      >
        {{ historyStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </AdminButton>
    </div>
  </form>
</template>
