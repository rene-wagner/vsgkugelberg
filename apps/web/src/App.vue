<script setup lang="ts">
import { RouterView } from 'vue-router';
import VsgFooter from './components/VsgFooter.vue';
import VsgHeader from './components/VsgHeader.vue';
</script>

<template>
  <VsgHeader />
  <RouterView />
  <VsgFooter />
</template>
