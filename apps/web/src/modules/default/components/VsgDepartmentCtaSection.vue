<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

interface Props {
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaRoute: string;
  secondaryCtaLabel: string;
  secondaryCtaRoute: string;
}

const props = defineProps<Props>();

// Check if secondary CTA is an external link (mailto, http, etc.)
const isSecondaryExternal = computed(() => {
  return (
    props.secondaryCtaRoute.startsWith('mailto:') ||
    props.secondaryCtaRoute.startsWith('http')
  );
});
</script>

<template>
  <section class="relative overflow-hidden py-32">
    <!-- Gold gradient background -->
    <div
      class="absolute inset-0 bg-linear-to-r from-vsg-gold-600 via-vsg-gold-400 to-vsg-gold-300"
    />

    <div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
      <!-- Title with line breaks preserved -->
      <h3
        class="font-display text-5xl leading-tight tracking-wider text-vsg-blue-900 md:text-7xl lg:text-8xl"
        v-html="title"
      />

      <p
        class="mx-auto mt-6 max-w-2xl font-body text-xl font-normal text-vsg-blue-800"
      >
        {{ description }}
      </p>

      <div
        class="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
      >
        <!-- Primary CTA (internal link) -->
        <RouterLink
          :to="primaryCtaRoute"
          class="blue-glow bg-vsg-blue-900 px-10 py-4 font-display text-2xl tracking-wider text-vsg-gold-400 transition-colors hover:bg-vsg-blue-800"
        >
          {{ primaryCtaLabel }}
        </RouterLink>

        <!-- Secondary CTA (can be external or internal) -->
        <a
          v-if="isSecondaryExternal"
          :href="secondaryCtaRoute"
          class="border-2 border-vsg-blue-900 px-10 py-4 font-display text-2xl tracking-wider text-vsg-blue-900 transition-colors hover:bg-vsg-blue-900/10"
        >
          {{ secondaryCtaLabel }}
        </a>
        <RouterLink
          v-else
          :to="secondaryCtaRoute"
          class="border-2 border-vsg-blue-900 px-10 py-4 font-display text-2xl tracking-wider text-vsg-blue-900 transition-colors hover:bg-vsg-blue-900/10"
        >
          {{ secondaryCtaLabel }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
