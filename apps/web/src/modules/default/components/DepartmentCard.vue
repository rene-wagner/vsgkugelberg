<script setup lang="ts">
import VsgLinkArrow from '@shared/components/VsgLinkArrow.vue';

interface Props {
  title: string;
  description: string;
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '#',
});
</script>

<template>
  <div class="card-hover group border border-gray-200 bg-gray-50 p-8">
    <div
      class="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-vsg-blue-600/10 transition-colors group-hover:bg-vsg-blue-600/20"
    >
      <slot name="icon">
        <svg
          class="h-8 w-8 text-vsg-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      </slot>
    </div>
    <h4 class="mb-3 font-display text-3xl tracking-wider text-vsg-blue-900">
      {{ title }}
    </h4>
    <p class="font-body font-extralight leading-relaxed text-gray-600">
      {{ description }}
    </p>
    <VsgLinkArrow :href="href" class="mt-6">Mehr erfahren</VsgLinkArrow>
  </div>
</template>
