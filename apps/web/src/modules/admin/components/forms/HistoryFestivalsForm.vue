<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useHistoryStore } from '../../stores/historyStore';
import type { HistoryContent, FestivalItem } from '../../types/history.types';
import HistoryFestivalItemRow from '../HistoryFestivalItemRow.vue';
import AdminButton from '../AdminButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const festivalsHeadline = ref('');
const festivalsDescription = ref('');
const localItems = ref<FestivalItem[]>([]);

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      festivalsHeadline.value = newHistory.festivalsHeadline;
      festivalsDescription.value = newHistory.festivalsDescription;
      localItems.value = JSON.parse(JSON.stringify(newHistory.festivalsItems));
    }
  },
  { immediate: true },
);

function addItem() {
  localItems.value.push({ headline: '', text: '' });
}

function updateItem(index: number, data: FestivalItem) {
  localItems.value[index] = data;
}

function deleteItem(index: number) {
  localItems.value.splice(index, 1);
}

async function handleSubmit() {
  await historyStore.updateHistory({
    festivalsHeadline: festivalsHeadline.value,
    festivalsDescription: festivalsDescription.value,
    festivalsItems: localItems.value,
  });
}
</script>

<template>
  <form
    class="space-y-6 pb-12"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Veranstaltungen Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="festivalsHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Abschnitts-Überschrift
          </label>
          <input
            id="festivalsHeadline"
            v-model="festivalsHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="festivalsDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Einleitungstext
          </label>
          <textarea
            id="festivalsDescription"
            v-model="festivalsDescription"
            rows="3"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Veranstaltungs-Karten</h2>

      <div class="space-y-4">
        <VueDraggable
          v-model="localItems"
          handle=".drag-handle"
          :animation="200"
          class="space-y-3"
        >
          <HistoryFestivalItemRow
            v-for="(item, index) in localItems"
            :key="index"
            :item="item"
            @update="(data) => updateItem(index, data)"
            @delete="deleteItem(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addItem"
        >
          <FontAwesomeIcon icon="plus" />
          Karte hinzufügen
        </button>
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
