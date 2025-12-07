<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import { useEditModeStore } from '@/stores/editMode';
import VsgBlockColumns from './VsgBlockColumns.vue';
import VsgBlockPicker from '../VsgBlockPicker.vue';

const props = withDefaults(
  defineProps<{
    isHero?: boolean;
    blockId?: string;
  }>(),
  {
    isHero: false,
    blockId: undefined,
  }
);

const pageBuilderStore = usePageBuilderStore();
const editModeStore = useEditModeStore();
const { isEditMode } = storeToRefs(editModeStore);

const showBlockPicker = ref(false);

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
  <section
    :class="{
      'w-screen h-screen flex items-center justify-center': isHero,
      'relative min-h-16 border-2 border-dashed border-blue-400 bg-blue-50/30 p-4 my-2 rounded-lg':
        isEditMode && blockId,
    }"
    class="section-block"
  >
    <slot>
      <VsgBlockColumns
        v-for="child in childBlocks"
        :key="child.id"
        :block-id="child.id"
        :column-count="(child.props.columnCount as number) ?? 1"
      />
    </slot>

    <div v-if="isEditMode && blockId" class="flex justify-center py-2">
      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-dashed border-gray-300 transition-colors"
        aria-label="Add columns block"
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
        <span>Add Columns</span>
      </button>

      <VsgBlockPicker
        v-if="showBlockPicker"
        :parent-id="blockId"
        class="top-full mt-1 left-1/2 -translate-x-1/2"
        @select="handleBlockSelect"
        @close="handlePickerClose"
      />
    </div>
  </section>
</template>
