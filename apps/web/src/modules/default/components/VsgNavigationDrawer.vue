<script setup lang="ts">
/**
 * VsgNavigationDrawer - Edit mode navigation drawer component
 *
 * A responsive drawer that slides in from the right when edit mode is enabled.
 * Includes a persistent flag/tab on the left edge for toggling edit mode.
 * Uses push-based layout (non-overlapping) with smooth CSS transitions.
 *
 * Props: None
 * Events: None
 * Slots: None
 */
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useEditModeStore } from '@modules/default/stores/editModeStore';
import { useAuthStore } from '@modules/auth/stores/authStore';
import VsgIconCog from '@shared/components/VsgIconCog.vue';

const editModeStore = useEditModeStore();
const authStore = useAuthStore();
const { isEditMode } = storeToRefs(editModeStore);
const { isAuthenticated } = storeToRefs(authStore);

function toggleEditMode() {
  editModeStore.toggleEditMode();
}

const flagAriaLabel = computed(() =>
  isEditMode.value ? 'Edit mode beenden' : 'Edit mode aktivieren',
);
</script>

<template>
  <!-- Drawer wrapper - contains both flag and drawer content -->
  <div
    v-if="isAuthenticated"
    class="fixed inset-y-0 right-0 z-30 w-96 transition-transform duration-300 ease-out"
    :class="isEditMode ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Flag element - positioned on left edge of drawer -->
    <button
      class="absolute left-0 top-1/2 z-40 -translate-x-full -translate-y-1/2 flex items-center justify-center rounded-l-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-vsg-gold-400 focus:ring-offset-2 focus:ring-offset-vsg-blue-900"
      :class="[
        isEditMode
          ? 'bg-vsg-gold-400 text-vsg-blue-900 hover:bg-vsg-gold-300 h-14 w-10'
          : 'bg-vsg-blue-800 text-vsg-gold-400 hover:bg-vsg-blue-700 hover:text-vsg-gold-300 h-12 w-9',
      ]"
      :aria-label="flagAriaLabel"
      @click="toggleEditMode"
    >
      <VsgIconCog :class="isEditMode ? 'h-6 w-6' : 'h-5 w-5'" />
    </button>

    <!-- Drawer content -->
    <div
      class="h-full w-full bg-vsg-blue-800 border-l-4 border-vsg-gold-400 shadow-2xl"
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
  </div>
</template>

<style scoped>
/* Drawer transitions handled by Tailwind classes */
</style>
