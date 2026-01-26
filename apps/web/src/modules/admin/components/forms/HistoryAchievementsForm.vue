<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useHistoryStore } from '../../stores/historyStore';
import type { HistoryContent, AchievementItem } from '../../types/history.types';
import HistoryAchievementRow from '../HistoryAchievementRow.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const achievementsHeadline = ref('');
const localItems = ref<AchievementItem[]>([]);

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      achievementsHeadline.value = newHistory.achievementsHeadline;
      localItems.value = JSON.parse(JSON.stringify(newHistory.achievementsItems));
    }
  },
  { immediate: true },
);

function addItem() {
  localItems.value.push({
    year: '',
    headline: '',
    description: '',
    category: 'Alle',
  });
}

function updateItem(index: number, data: AchievementItem) {
  localItems.value[index] = data;
}

function deleteItem(index: number) {
  localItems.value.splice(index, 1);
}

async function handleSubmit() {
  await historyStore.updateHistory({
    achievementsHeadline: achievementsHeadline.value,
    achievementsItems: localItems.value,
  });
}
</script>

<template>
  <form
    class="space-y-6 pb-12"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Hall of Fame Bereich</h2>

      <div>
        <label
          for="achievementsHeadline"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Abschnitts-Überschrift
        </label>
        <input
          id="achievementsHeadline"
          v-model="achievementsHeadline"
          type="text"
          required
          class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Erfolge (Einträge)</h2>

      <div class="space-y-4">
        <VueDraggable
          v-model="localItems"
          handle=".drag-handle"
          :animation="200"
          class="space-y-3"
        >
          <HistoryAchievementRow
            v-for="(item, index) in localItems"
            :key="index"
            :achievement="item"
            @update="(data) => updateItem(index, data)"
            @delete="deleteItem(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addItem"
        >
          <FontAwesomeIcon icon="plus" />
          Erfolg hinzufügen
        </button>
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
