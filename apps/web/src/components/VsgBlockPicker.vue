<script lang="ts" setup>
import { ref, computed, type Component } from 'vue';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import {
  VsgIconChevronLeft,
  VsgIconBlockSection,
  VsgIconBlockColumns,
  VsgIconBlockColumn,
  VsgIconBlockHeadline,
  VsgIconBlockParagraph,
  VsgIconBlockImage,
} from '@/components/icons';

const props = defineProps<{
  parentId: string | null;
}>();

const emit = defineEmits<{
  select: [config: { type: BlockType; props?: Record<string, unknown> }];
  close: [];
}>();

const pageBuilderStore = usePageBuilderStore();
const selectedColumnCount = ref(1);
const showColumnCountSelector = ref(false);
const showSectionTypeSelector = ref(false);

const allowedTypes = computed(() => {
  return pageBuilderStore.getAllowedChildren(props.parentId);
});

const blockTypeLabels: Record<BlockType, string> = {
  section: 'Section',
  columns: 'Columns',
  column: 'Column',
  headline: 'Headline',
  paragraph: 'Paragraph',
  image: 'Image',
};

const blockTypeIcons: Record<BlockType, Component> = {
  section: VsgIconBlockSection,
  columns: VsgIconBlockColumns,
  column: VsgIconBlockColumn,
  headline: VsgIconBlockHeadline,
  paragraph: VsgIconBlockParagraph,
  image: VsgIconBlockImage,
};

const handleBlockTypeClick = (type: BlockType) => {
  if (type === 'section') {
    showSectionTypeSelector.value = true;
  } else if (type === 'columns') {
    showColumnCountSelector.value = true;
  } else {
    emit('select', { type });
  }
};

const handleColumnCountSelect = (count: number) => {
  selectedColumnCount.value = count;
  emit('select', { type: 'columns', props: { columnCount: count } });
  showColumnCountSelector.value = false;
};

const handleSectionTypeSelect = (isHero: boolean) => {
  emit('select', { type: 'section', props: { isHero } });
  showSectionTypeSelector.value = false;
};

const handleBackClick = () => {
  showColumnCountSelector.value = false;
  showSectionTypeSelector.value = false;
};

const handleClose = () => {
  showColumnCountSelector.value = false;
  showSectionTypeSelector.value = false;
  emit('close');
};
</script>

<template>
  <div
    class="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48"
    @click.stop
  >
    <div v-if="!showColumnCountSelector && !showSectionTypeSelector">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Block</div>
      <div class="space-y-1">
        <button
          v-for="type in allowedTypes"
          :key="type"
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          @click="handleBlockTypeClick(type)"
        >
          <component :is="blockTypeIcons[type]" class="text-gray-500" />
          <span>{{ blockTypeLabels[type] }}</span>
        </button>
      </div>
      <button
        type="button"
        class="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 py-1"
        @click="handleClose"
      >
        Cancel
      </button>
    </div>

    <div v-else-if="showSectionTypeSelector">
      <div class="flex items-center gap-2 mb-2">
        <button
          type="button"
          class="p-1 text-gray-500 hover:text-gray-700 rounded"
          aria-label="Back"
          @click="handleBackClick"
        >
          <VsgIconChevronLeft size="w-4 h-4" />
        </button>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Section Type
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex flex-col items-center justify-center p-3 border rounded-md hover:bg-gray-100 hover:border-blue-500 transition-colors"
          @click="handleSectionTypeSelect(false)"
        >
          <div class="w-full h-8 border-2 border-gray-400 rounded mb-1"></div>
          <span class="text-xs text-gray-600">Normal</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center justify-center p-3 border rounded-md hover:bg-gray-100 hover:border-blue-500 transition-colors"
          @click="handleSectionTypeSelect(true)"
        >
          <div
            class="w-full h-8 border-2 border-gray-400 rounded mb-1 flex items-center justify-center"
          >
            <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <span class="text-xs text-gray-600">Hero</span>
        </button>
      </div>
    </div>

    <div v-else-if="showColumnCountSelector">
      <div class="flex items-center gap-2 mb-2">
        <button
          type="button"
          class="p-1 text-gray-500 hover:text-gray-700 rounded"
          aria-label="Back"
          @click="handleBackClick"
        >
          <VsgIconChevronLeft size="w-4 h-4" />
        </button>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Column Count
        </span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="count in [1, 2, 3, 4]"
          :key="count"
          type="button"
          class="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100 hover:border-blue-500 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': selectedColumnCount === count }"
          @click="handleColumnCountSelect(count)"
        >
          <div class="flex gap-0.5">
            <div v-for="i in count" :key="i" class="w-2 h-6 bg-gray-400 rounded-sm"></div>
          </div>
          <span class="text-xs text-gray-600 mt-1">{{ count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
