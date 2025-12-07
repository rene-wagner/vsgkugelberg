<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import { useEditModeStore } from '@/stores/editMode';
import VsgBlockColumn from './VsgBlockColumn.vue';
import VsgBlockPicker from '../VsgBlockPicker.vue';

const props = withDefaults(
  defineProps<{
    columnCount?: number;
    blockId?: string;
  }>(),
  {
    columnCount: 1,
    blockId: undefined,
  }
);

const pageBuilderStore = usePageBuilderStore();
const editModeStore = useEditModeStore();
const { isEditMode } = storeToRefs(editModeStore);

const showBlockPicker = ref(false);

const gridColumnsClass = computed(() => {
  const columnClasses: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12',
  };
  return columnClasses[props.columnCount] || 'md:grid-cols-1';
});

const childBlocks = computed(() => {
  if (!props.blockId) return [];
  return pageBuilderStore.getChildBlocks(props.blockId);
});

const handleAddClick = () => {
  showBlockPicker.value = true;
};

const handleBlockSelect = (config: { type: BlockType; props?: Record<string, unknown> }) => {
  if (props.blockId) {
    pageBuilderStore.addBlock(config.type, props.blockId, config.props);
  }
  showBlockPicker.value = false;
};

const handlePickerClose = () => {
  showBlockPicker.value = false;
};
</script>

<template>
  <div
    class="columns-block relative"
    :class="{
      'border-2 border-dashed border-green-400 bg-green-50/30 p-3 my-2 rounded-lg':
        isEditMode && blockId,
    }"
  >
    <div class="grid grid-cols-1 gap-4" :class="gridColumnsClass">
      <slot>
        <VsgBlockColumn v-for="child in childBlocks" :key="child.id" :block-id="child.id" />
      </slot>
    </div>

    <div v-if="isEditMode && blockId" class="flex justify-center py-2 relative">
      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-dashed border-gray-300 transition-colors"
        aria-label="Add column block"
        @click="handleAddClick"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Add Column</span>
      </button>

      <VsgBlockPicker
        v-if="showBlockPicker"
        :parent-id="blockId"
        class="top-full mt-1 left-1/2 -translate-x-1/2"
        @select="handleBlockSelect"
        @close="handlePickerClose"
      />
    </div>
  </div>
</template>
