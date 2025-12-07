<script lang="ts" setup>
defineProps<{
  content?: string;
}>();
</script>

<template>
  <p class="text-gray-700 leading-relaxed">{{ content }}</p>
</template>
