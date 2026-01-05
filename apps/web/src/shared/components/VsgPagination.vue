<script setup lang="ts">
import { computed } from 'vue';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const props = defineProps<{
  meta: PaginationMeta;
}>();

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const displayedPages = computed(() => {
  const current = props.meta.page;
  const last = props.meta.totalPages;
  const delta = 2;
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

function goToPage(page: number | string) {
  if (typeof page === 'number' && page !== props.meta.page) {
    emit('page-change', page);
  }
}

const startEntry = computed(() => (props.meta.page - 1) * props.meta.limit + 1);
const endEntry = computed(() =>
  Math.min(props.meta.page * props.meta.limit, props.meta.total),
);
</script>

<template>
  <div
    class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50"
  >
    <div class="font-body font-normal text-sm text-gray-500">
      Zeige
      <span class="text-vsg-blue-900 font-medium">{{ startEntry }}</span>
      bis
      <span class="text-vsg-blue-900 font-medium">{{ endEntry }}</span>
      von
      <span class="text-vsg-blue-900 font-medium">{{ meta.total }}</span>
      Einträgen
    </div>

    <div v-if="meta.totalPages > 1" class="flex items-center gap-1">
      <!-- Previous -->
      <button
        class="p-2 text-gray-400 hover:text-vsg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        :disabled="meta.page === 1"
        @click="goToPage(meta.page - 1)"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="(page, index) in displayedPages" :key="index">
        <span
          v-if="page === '...'"
          class="px-3 py-1 text-gray-400 font-body text-sm"
        >
          ...
        </span>
        <button
          v-else
          class="min-w-[32px] px-3 py-1 rounded-lg font-body text-sm transition-all"
          :class="[
            page === meta.page
              ? 'bg-vsg-blue-600 text-white font-medium shadow-sm'
              : 'text-gray-600 hover:bg-vsg-blue-50 hover:text-vsg-blue-600',
          ]"
          @click="goToPage(page as number)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next -->
      <button
        class="p-2 text-gray-400 hover:text-vsg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        :disabled="meta.page === meta.totalPages"
        @click="goToPage(meta.page + 1)"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
