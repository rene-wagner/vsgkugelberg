<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import VsgFooter from './components/VsgFooter.vue';
import VsgHeader from './components/VsgHeader.vue';
import { useUserStore } from './stores/user';

const userStore = useUserStore();

onMounted(() => {
  userStore.loadUser();
});
</script>

<template>
  <VsgHeader />
  <RouterView />
  <VsgFooter />
</template>
