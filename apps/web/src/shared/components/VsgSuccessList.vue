<script setup lang="ts">
import { ref, computed } from 'vue';

interface SuccessItem {
  year: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  colorClass: string;
}

const props = defineProps<{
  items: SuccessItem[];
  categories: { id: string; label: string }[];
}>();

const currentFilter = ref('all');

const filteredItems = computed(() => {
  if (currentFilter.value === 'all') return props.items;
  return props.items.filter((item) => item.category === currentFilter.value);
});

const setFilter = (id: string) => {
  currentFilter.value = id;
};
</script>

<template>
  <div>
    <!-- Filter Buttons -->
    <div class="flex flex-wrap justify-center gap-4 mb-12">
      <button
        v-for="cat in [{ id: 'all', label: 'ALLE' }, ...categories]"
        :key="cat.id"
        class="filter-btn font-display text-lg tracking-widest border-2 px-6 py-2 transition-all"
        :class="[
          currentFilter === cat.id
            ? 'active border-vsg-gold-600 bg-vsg-gold-600 text-white'
            : 'border-vsg-gold-600/30 text-vsg-gold-600 hover:bg-vsg-gold-600 hover:text-white',
        ]"
        @click="setFilter(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Success List -->
    <div class="grid md:grid-cols-2 gap-6">
      <transition-group name="list">
        <div
          v-for="item in filteredItems"
          :key="item.title"
          class="success-item bg-white p-6 border-l-4 animate-fadeIn shadow-sm"
          :class="item.colorClass"
        >
          <div class="flex justify-between items-start mb-4">
            <span class="font-display text-xl text-vsg-gold-600">{{
              item.year
            }}</span>
            <span
              class="text-xs bg-gray-100 px-2 py-1 text-vsg-blue-600 uppercase tracking-widest"
              >{{ item.categoryLabel }}</span
            >
          </div>
          <h5 class="font-bold text-vsg-blue-900 uppercase tracking-wider mb-2">
            {{ item.title }}
          </h5>
          <p class="text-base text-gray-600">{{ item.description }}</p>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
