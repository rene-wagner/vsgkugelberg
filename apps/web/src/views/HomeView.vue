<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import { useEditModeStore } from '@/stores/editMode';
import VsgBlockSection from '@/components/blocks/VsgBlockSection.vue';
import VsgBlockPicker from '@/components/VsgBlockPicker.vue';

const pageBuilderStore = usePageBuilderStore();
const editModeStore = useEditModeStore();
const route = useRoute();
const { isEditMode } = storeToRefs(editModeStore);
const { rootBlocks, isLoading } = storeToRefs(pageBuilderStore);

const showBlockPicker = ref(false);

const hasContent = computed(() => rootBlocks.value.length > 0);

onMounted(() => {
  pageBuilderStore.loadBlocks(route.path);
});

const handleAddClick = () => {
  showBlockPicker.value = true;
};

const handleBlockSelect = (config: { type: BlockType; props?: Record<string, unknown> }) => {
  pageBuilderStore.addBlock(config.type, null, config.props);
  showBlockPicker.value = false;
};

const handlePickerClose = () => {
  showBlockPicker.value = false;
};
</script>

<template>
  <main class="min-h-screen">
    <div v-if="isLoading" class="flex items-center justify-center h-96">
      <svg class="w-8 h-8 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    <template v-else-if="hasContent || isEditMode">
      <VsgBlockSection
        v-for="block in rootBlocks"
        :key="block.id"
        :block-id="block.id"
        :is-hero="(block.props.isHero as boolean) ?? false"
      />

      <div v-if="isEditMode" class="flex justify-center py-8 relative">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 transition-colors"
          aria-label="Add section block"
          @click="handleAddClick"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Section</span>
        </button>

        <VsgBlockPicker
          v-if="showBlockPicker"
          :parent-id="null"
          class="top-full mt-2 left-1/2 -translate-x-1/2"
          @select="handleBlockSelect"
          @close="handlePickerClose"
        />
      </div>
    </template>

    <div v-else class="flex items-center justify-center h-96 text-gray-500">
      <p>Noch kein Inhalt. Aktiviere den Bearbeitungsmodus, um zu beginnen.</p>
    </div>
  </main>
</template>
