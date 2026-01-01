<script setup lang="ts">
import { storeToRefs } from 'pinia';
import VsgNavbar from '@shared/components/VsgNavbar.vue';
import VsgFooter from '@shared/components/VsgFooter.vue';
import VsgNavigationDrawer from '@modules/default/components/VsgNavigationDrawer.vue';
import { useEditModeStore } from '@modules/default/stores/editModeStore';

const editModeStore = useEditModeStore();
const { isEditMode } = storeToRefs(editModeStore);
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-vsg-blue-900 text-white">
    <VsgNavbar />
    <div class="flex">
      <main
        class="flex-1 transition-all duration-300 ease-out"
        :class="{ 'mr-96': isEditMode }"
      >
        <router-view />
      </main>
      <VsgNavigationDrawer />
    </div>
    <VsgFooter />
  </div>
</template>
