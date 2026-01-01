<script setup lang="ts">
/**
 * VsgNavigationDrawer - Edit mode navigation drawer component
 *
 * A responsive drawer that slides in from the right when edit mode is enabled.
 * Uses push-based layout (non-overlapping) with smooth CSS transitions.
 *
 * Props: None
 * Events: None
 * Slots: None
 */
import { storeToRefs } from 'pinia';
import { useEditModeStore } from '@modules/default/stores/editModeStore';

const editModeStore = useEditModeStore();
const { isEditMode } = storeToRefs(editModeStore);
</script>

<template>
  <Transition name="drawer">
    <div
      v-if="isEditMode"
      class="fixed inset-y-0 right-0 z-30 w-96 bg-vsg-blue-800 border-l-4 border-vsg-gold-400 shadow-2xl"
    >
      <div class="flex h-full flex-col p-6">
        <h2 class="font-display text-2xl tracking-wider text-vsg-gold-400">
          Edit Mode
        </h2>
        <div class="mt-8 flex-1 flex items-center justify-center">
          <p class="text-vsg-gold-300/60 text-lg">Placeholder content</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease-out;
}

.drawer-enter-from {
  transform: translateX(100%);
}

.drawer-leave-to {
  transform: translateX(100%);
}
</style>
