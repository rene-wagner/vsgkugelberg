<script setup lang="ts">
interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

defineProps<{
  title: string;
  items: TimelineItem[];
}>();
</script>

<template>
  <div class="lg:pl-12 border-l-2 border-gray-100 relative space-y-12">
    <h3 class="font-display text-3xl text-vsg-blue-900 mb-8">{{ title }}</h3>

    <div
      v-for="item in items"
      :key="item.year"
      class="timeline-item relative pl-10"
    >
      <span class="font-display text-vsg-gold-600 text-xl">{{
        item.year
      }}</span>
      <h4 class="font-bold text-vsg-blue-900 mt-1">{{ item.title }}</h4>
      <p class="text-base text-gray-600 mt-2">{{ item.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.timeline-item::before {
  content: '';
  position: absolute;
  left: -9px;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fcd34d; /* var(--vsg-gold-primary) */
  border: 4px solid #ffffff;
}
</style>
