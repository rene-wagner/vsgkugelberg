<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref } from 'vue';

interface AccordionItem {
  id: string | number;
  title: string;
  content: {
    year?: string;
    text: string;
  }[];
}

defineProps<{
  items: AccordionItem[];
}>();

const activeId = ref<string | number | null>(null);

const toggle = (id: string | number) => {
  if (activeId.value === id) {
    activeId.value = null;
  } else {
    activeId.value = id;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="item in items"
      :key="item.id"
      class="accordion-item bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      :class="{ active: activeId === item.id }"
    >
      <button
        class="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        @click="toggle(item.id)"
      >
        <span class="font-display text-xl text-vsg-gold-600">{{ item.title }}</span>
        <FontAwesomeIcon
          icon="chevron-down"
          class="accordion-icon transition-transform duration-300 text-vsg-blue-900"
          :class="{ 'rotate-180': activeId === item.id }"
        />
      </button>
      <div
        class="accordion-content transition-all duration-300 ease-out overflow-hidden"
        :style="{ maxHeight: activeId === item.id ? '1000px' : '0px' }"
      >
        <div class="p-6 pt-0 font-body text-base text-gray-600 space-y-4 border-t border-gray-100 mt-4">
          <div
            v-for="(entry, index) in item.content"
            :key="index"
            class="flex gap-4"
          >
            <span
              v-if="entry.year"
              class="text-vsg-gold-600 font-bold shrink-0"
              >{{ entry.year }}</span
            >
            <p>{{ entry.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-content {
  transition: max-height 0.3s ease-out;
}
</style>
