<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePageBuilderStore, type BlockType } from '@/stores/pageBuilder';
import { useEditModeStore } from '@/stores/editMode';
import VsgBlockSection from '@/components/blocks/VsgBlockSection.vue';
import VsgBlockPicker from '@/components/VsgBlockPicker.vue';
import { VsgIconSpinner, VsgIconPlus } from '@/components/icons';

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
      <VsgIconSpinner size="w-8 h-8" class="text-gray-500" />
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
          <VsgIconPlus />
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
