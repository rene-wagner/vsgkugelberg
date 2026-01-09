<script setup lang="ts">
import VsgNavbar from '@shared/components/VsgNavbar.vue';
import VsgFooter from '@shared/components/VsgFooter.vue';
import VsgToastContainer from '@shared/components/VsgToastContainer.vue';
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-vsg-blue-900 text-white">
    <VsgNavbar />
    <main>
      <router-view />
    </main>
    <VsgFooter />
    <VsgToastContainer />
  </div>
</template>
