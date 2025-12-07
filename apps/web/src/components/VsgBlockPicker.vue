<script lang="ts" setup>
import { ref, computed } from 'vue';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';

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

const blockTypeIcons: Record<BlockType, string> = {
  section:
    'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  columns: 'M9 4h6v16H9V4zM4 4h3v16H4V4zM17 4h3v16h-3V4z',
  column: 'M9 4h6v16H9V4z',
  headline: 'M4 6h16M4 12h16M4 18h7',
  paragraph: 'M4 6h16M4 10h16M4 14h16M4 18h10',
  image:
    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
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
          <svg
            class="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="blockTypeIcons[type]"
            />
          </svg>
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
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
