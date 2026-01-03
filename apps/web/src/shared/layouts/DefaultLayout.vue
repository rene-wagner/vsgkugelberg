<script setup lang="ts">
import VsgNavbar from '@shared/components/VsgNavbar.vue';
import VsgFooter from '@shared/components/VsgFooter.vue';
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-vsg-blue-900 text-white">
    <VsgNavbar />
    <main>
      <router-view />
    </main>
    <VsgFooter />
  </div>
</template>
