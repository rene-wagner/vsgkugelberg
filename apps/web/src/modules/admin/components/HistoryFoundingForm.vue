<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useHistoryStore } from '../stores/historyStore';
import type {
  HistoryContent,
  HistoryFact,
  HistoryMilestone,
} from '../types/history.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import HistoryFactRow from './HistoryFactRow.vue';
import HistoryMilestoneRow from './HistoryMilestoneRow.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  history: HistoryContent;
}>();

const historyStore = useHistoryStore();

const foundingHeadline = ref('');
const foundingDescription = ref('');
const foundingFactCardHeadline = ref('');
const foundingMilestonesHeadline = ref('');
const localFacts = ref<HistoryFact[]>([]);
const localMilestones = ref<HistoryMilestone[]>([]);

watch(
  () => props.history,
  (newHistory) => {
    if (newHistory) {
      foundingHeadline.value = newHistory.foundingHeadline;
      foundingDescription.value = newHistory.foundingDescription;
      foundingFactCardHeadline.value = newHistory.foundingFactCardHeadline;
      foundingMilestonesHeadline.value = newHistory.foundingMilestonesHeadline;
      localFacts.value = JSON.parse(JSON.stringify(newHistory.foundingFacts));
      localMilestones.value = JSON.parse(
        JSON.stringify(newHistory.foundingMilestones),
      );
    }
  },
  { immediate: true },
);

function addFact() {
  localFacts.value.push({ year: '', headline: '', description: '' });
}

function updateFact(index: number, data: HistoryFact) {
  localFacts.value[index] = data;
}

function deleteFact(index: number) {
  localFacts.value.splice(index, 1);
}

function addMilestone() {
  localMilestones.value.push({ year: '', headline: '', description: '' });
}

function updateMilestone(index: number, data: HistoryMilestone) {
  localMilestones.value[index] = data;
}

function deleteMilestone(index: number) {
  localMilestones.value.splice(index, 1);
}

async function handleSubmit() {
  await historyStore.updateHistory({
    foundingHeadline: foundingHeadline.value,
    foundingDescription: foundingDescription.value,
    foundingFactCardHeadline: foundingFactCardHeadline.value,
    foundingMilestonesHeadline: foundingMilestonesHeadline.value,
    foundingFacts: localFacts.value,
    foundingMilestones: localMilestones.value,
  });
}
</script>

<template>
  <form class="space-y-6 pb-12" @submit.prevent="handleSubmit">
    <!-- Founding Basics -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        GRÜNDUNGSDATEN
      </h2>

      <div class="space-y-6">
        <div>
          <label
            for="foundingHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Abschnitts-Überschrift
          </label>
          <input
            id="foundingHeadline"
            v-model="foundingHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="foundingDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung (Markdown)
          </label>
          <VsgMarkdownEditor
            v-model="foundingDescription"
            placeholder="Die Geschichte der Gründung..."
            min-height="200px"
          />
        </div>
      </div>
    </div>

    <!-- Facts Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        DIE ECKDATEN (FACT CARD)
      </h2>

      <div class="mb-6">
        <label
          for="foundingFactCardHeadline"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Karten-Überschrift
        </label>
        <input
          id="foundingFactCardHeadline"
          v-model="foundingFactCardHeadline"
          type="text"
          class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>

      <div class="space-y-4">
        <VueDraggable
          v-model="localFacts"
          handle=".drag-handle"
          :animation="200"
          class="space-y-2"
        >
          <HistoryFactRow
            v-for="(fact, index) in localFacts"
            :key="index"
            :fact="fact"
            @update="(data) => updateFact(index, data)"
            @delete="deleteFact(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addFact"
        >
          <FontAwesomeIcon icon="plus" />
          Eckdatum hinzufügen
        </button>
      </div>
    </div>

    <!-- Milestones Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        MEILENSTEINE & FUSIONEN
      </h2>

      <div class="mb-6">
        <label
          for="foundingMilestonesHeadline"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Zeitstrahl-Überschrift
        </label>
        <input
          id="foundingMilestonesHeadline"
          v-model="foundingMilestonesHeadline"
          type="text"
          class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>

      <div class="space-y-4">
        <VueDraggable
          v-model="localMilestones"
          handle=".drag-handle"
          :animation="200"
          class="space-y-2"
        >
          <HistoryMilestoneRow
            v-for="(milestone, index) in localMilestones"
            :key="index"
            :milestone="milestone"
            @update="(data) => updateMilestone(index, data)"
            @delete="deleteMilestone(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addMilestone"
        >
          <FontAwesomeIcon icon="plus" />
          Meilenstein hinzufügen
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
