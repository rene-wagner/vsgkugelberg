<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useHomepageContentStore } from '../../stores/homepageContentStore';
import type { HomepageContent, HomepageStat } from '../../types/homepage-content.types';
import HomepageStatRow from '../HomepageStatRow.vue';
import AdminButton from '../AdminButton.vue';

const props = defineProps<{
  homepageContent: HomepageContent;
}>();

const homepageContentStore = useHomepageContentStore();

const localStats = ref<HomepageStat[]>([]);

watch(
  () => props.homepageContent,
  (newContent) => {
    if (newContent) {
      localStats.value = JSON.parse(JSON.stringify(newContent.stats));
    }
  },
  { immediate: true },
);

function addStat() {
  localStats.value.push({ label: '', value: '' });
}

function updateStat(index: number, data: HomepageStat) {
  localStats.value[index] = data;
}

function deleteStat(index: number) {
  localStats.value.splice(index, 1);
}

async function handleSubmit() {
  await homepageContentStore.updateHomepageContent({
    stats: localStats.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Statistiken</h2>

      <p class="font-body text-sm text-gray-600 mb-6">
        Die Statistiken werden im Hero-Bereich der Startseite angezeigt. Die Reihenfolge kann per Drag & Drop angepasst werden.
      </p>

      <div class="space-y-4">
        <VueDraggable
          v-model="localStats"
          handle=".drag-handle"
          :animation="200"
          class="space-y-2"
        >
          <HomepageStatRow
            v-for="(stat, index) in localStats"
            :key="index"
            :stat="stat"
            @update="(data) => updateStat(index, data)"
            @delete="deleteStat(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addStat"
        >
          <FontAwesomeIcon icon="plus" />
          Statistik hinzufügen
        </button>
      </div>
    </div>

    <div class="flex justify-end">
      <AdminButton
        type="submit"
        size="large"
        :disabled="homepageContentStore.isSaving"
        :loading="homepageContentStore.isSaving"
      >
        {{ homepageContentStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </AdminButton>
    </div>
  </form>
</template>
