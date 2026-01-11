<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ChartData } from '../types/history.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  modelValue: ChartData;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChartData): void;
}>();

const localData = ref<ChartData>({ labels: [], datasets: [] });

watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = JSON.parse(JSON.stringify(newVal));
    if (localData.value.datasets.length === 0) {
      localData.value.datasets.push({ label: 'Mitglieder', data: [] });
    }
  },
  { immediate: true },
);

function addColumn() {
  localData.value.labels.push('');
  localData.value.datasets.forEach((ds) => ds.data.push(0));
  emitUpdate();
}

function removeColumn(index: number) {
  localData.value.labels.splice(index, 1);
  localData.value.datasets.forEach((ds) => ds.data.splice(index, 1));
  emitUpdate();
}

function updateLabel(index: number, val: string) {
  localData.value.labels[index] = val;
  emitUpdate();
}

function updateValue(dsIndex: number, dataIndex: number, val: string) {
  const num = parseFloat(val) || 0;
  localData.value.datasets[dsIndex].data[dataIndex] = num;
  emitUpdate();
}

function emitUpdate() {
  emit('update:modelValue', localData.value);
}
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="p-2 text-xs font-display tracking-widest text-vsg-blue-600 uppercase border-b border-gray-200 w-32">Datensatz</th>
            <th v-for="(label, index) in localData.labels" :key="index" class="p-2 border-b border-gray-200 min-w-20">
              <div class="flex flex-col gap-1">
                <input
                  :value="label"
                  type="text"
                  placeholder="Jahr"
                  class="w-full px-2 py-1 text-xs text-vsg-blue-900 text-center border border-gray-300 rounded focus:border-vsg-blue-600 outline-none font-bold"
                  @input="updateLabel(index, ($event.target as HTMLInputElement).value)"
                />
                <button type="button" class="text-[10px] text-red-400 hover:text-red-600 uppercase font-bold" @click="removeColumn(index)">
                  Löschen
                </button>
              </div>
            </th>
            <th class="p-2 border-b border-gray-200"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ds, dsIndex) in localData.datasets" :key="dsIndex">
            <td class="p-2 border-b border-gray-100 text-sm font-body text-vsg-blue-900">
              {{ ds.label }}
            </td>
            <td v-for="(val, dataIndex) in ds.data" :key="dataIndex" class="p-2 border-b border-gray-100">
              <input
                :value="val"
                type="number"
                class="w-full px-2 py-1 text-xs text-vsg-blue-900 text-center border border-gray-200 rounded focus:border-vsg-blue-600 outline-none"
                @input="updateValue(dsIndex, dataIndex, ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td class="p-2 border-b border-gray-100"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      type="button"
      class="py-2 px-4 border border-vsg-blue-600 text-vsg-blue-600 rounded-lg hover:bg-vsg-blue-50 transition-colors font-body text-xs flex items-center justify-center gap-2"
      @click="addColumn"
    >
      <FontAwesomeIcon icon="plus" />
      Datenpunkt hinzufügen
    </button>
  </div>
</template>
