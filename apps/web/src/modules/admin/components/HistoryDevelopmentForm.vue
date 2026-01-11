<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useHistoryStore } from '../stores/historyStore';
import type {
  HistoryContent,
  ChronicleGroup,
  ChartData,
} from '../types/history.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import HistoryChartEditor from './HistoryChartEditor.vue';
import HistoryChronicleGroupEditor from './HistoryChronicleGroupEditor.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const developmentHeadline = ref('');
const developmentDescription = ref('');
const localChartData = ref<ChartData>({ labels: [], datasets: [] });
const localChronicleGroups = ref<ChronicleGroup[]>([]);

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      developmentHeadline.value = newHistory.developmentHeadline;
      developmentDescription.value = newHistory.developmentDescription;
      localChartData.value = JSON.parse(
        JSON.stringify(newHistory.developmentChartData),
      );
      localChronicleGroups.value = JSON.parse(
        JSON.stringify(newHistory.developmentChronicleGroups),
      );
    }
  },
  { immediate: true },
);

function addGroup() {
  localChronicleGroups.value.push({ headline: '', content: [] });
}

function updateGroup(index: number, data: ChronicleGroup) {
  localChronicleGroups.value[index] = data;
}

function deleteGroup(index: number) {
  localChronicleGroups.value.splice(index, 1);
}

async function handleSubmit() {
  await historyStore.updateHistory({
    developmentHeadline: developmentHeadline.value,
    developmentDescription: developmentDescription.value,
    developmentChartData: localChartData.value,
    developmentChronicleGroups: localChronicleGroups.value,
  });
}
</script>

<template>
  <form class="space-y-6 pb-12" @submit.prevent="handleSubmit">
    <!-- Development Basics -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        ENTWICKLUNGSDATEN
      </h2>

      <div class="space-y-6">
        <div>
          <label
            for="developmentHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Abschnitts-Überschrift
          </label>
          <input
            id="developmentHeadline"
            v-model="developmentHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="developmentDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung (Markdown)
          </label>
          <VsgMarkdownEditor
            v-model="developmentDescription"
            placeholder="Die Geschichte der Entwicklung..."
            min-height="200px"
          />
        </div>
      </div>
    </div>

    <!-- Chart Editor -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2
        class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase"
      >
        Mitgliederstatistik (Diagramm)
      </h2>

      <HistoryChartEditor v-model="localChartData" />
    </div>

    <!-- Chronicle Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2
        class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase"
      >
        Chronik der Ereignisse
      </h2>

      <div class="space-y-6">
        <VueDraggable
          v-model="localChronicleGroups"
          handle=".drag-handle"
          :animation="200"
          class="space-y-6"
        >
          <HistoryChronicleGroupEditor
            v-for="(group, index) in localChronicleGroups"
            :key="index"
            :group="group"
            @update="(data) => updateGroup(index, data)"
            @delete="deleteGroup(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addGroup"
        >
          <FontAwesomeIcon icon="plus" />
          Chronik-Gruppe hinzufügen
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
