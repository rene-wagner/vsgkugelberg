<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Fact {
  label: string;
  value: string;
}

defineProps<{
  title: string;
  facts: Fact[];
}>();
</script>

<template>
  <div
    class="bg-gray-50 p-8 border border-gray-200 shadow-2xl relative overflow-hidden group"
  >
    <div
      class="absolute -right-8 -bottom-8 w-32 h-32 bg-vsg-gold-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"
    ></div>
    <h3
      class="font-display text-2xl text-vsg-gold-600 mb-6 flex items-center gap-3"
    >
      <slot name="icon">
        <FontAwesomeIcon icon="check" class="text-vsg-gold-600" />
      </slot>
      {{ title }}
    </h3>
    <div class="grid sm:grid-cols-2 gap-6 text-base">
      <div v-for="fact in facts" :key="fact.label">
        <span
          class="block text-vsg-blue-600 uppercase tracking-widest text-xs mb-1"
          >{{ fact.label }}</span
        >
        <span class="font-bold text-vsg-blue-900">{{ fact.value }}</span>
      </div>
    </div>
  </div>
</template>
