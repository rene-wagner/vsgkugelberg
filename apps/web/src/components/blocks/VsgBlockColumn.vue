<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import { useEditModeStore } from '@/stores/editMode';
import VsgBlockHeadline from './VsgBlockHeadline.vue';
import VsgBlockParagraph from './VsgBlockParagraph.vue';
import VsgBlockImage from './VsgBlockImage.vue';
import VsgBlockPicker from '../VsgBlockPicker.vue';

const props = defineProps<{
  blockId?: string;
}>();

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

const handleRemoveClick = () => {
  if (props.blockId) {
    pageBuilderStore.removeBlock(props.blockId);
  }
};
</script>

<template>
  <div
    class="column-block min-h-8 relative"
    :class="{
      'border-2 border-dashed border-orange-400 bg-orange-50/30 p-3 rounded-lg':
        isEditMode && blockId,
    }"
  >
    <button
      v-if="isEditMode && blockId"
      type="button"
      class="absolute top-2 right-2 p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors z-10"
      aria-label="Remove column"
      @click="handleRemoveClick"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
    <slot>
      <template v-for="child in childBlocks" :key="child.id">
        <VsgBlockHeadline
          v-if="child.type === 'headline'"
          :level="(child.props.level as 1 | 2 | 3 | 4 | 5 | 6) ?? 2"
          :content="(child.props.content as string) ?? ''"
        />
        <VsgBlockParagraph
          v-else-if="child.type === 'paragraph'"
          :content="(child.props.content as string) ?? ''"
        />
        <VsgBlockImage
          v-else-if="child.type === 'image'"
          :src="(child.props.src as string) ?? ''"
          :alt="(child.props.alt as string) ?? ''"
        />
      </template>
    </slot>

    <div v-if="isEditMode && blockId" class="flex justify-center py-2 relative">
      <button
        type="button"
        class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-dashed border-gray-300 transition-colors"
        aria-label="Add content block"
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
        <span>Add Content</span>
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
