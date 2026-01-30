<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgButton from '@shared/components/VsgButton.vue';

interface Props {
  headline?: string;
  description?: string;
  tag?: string;
  logo?: { path: string; originalName: string } | null;
}

const props = withDefaults(defineProps<Props>(), {
  headline: 'VSG',
  description: 'Tradition trifft Leidenschaft. Gemeinsam stark in Weißenfels.\nDein Verein. Deine Heimat.',
  tag: 'Sportverein seit 1985',
  logo: null,
});

const logoUrl = computed(() => {
  if (!props.logo) return null;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${apiBaseUrl}${props.logo.path}`;
});
</script>

<template>
  <section class="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-linear-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent" />

    <!-- Decorative elements -->
    <div class="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-vsg-gold-400/10 blur-3xl" />
    <div class="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-vsg-blue-500/20 blur-3xl" />

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">

      <div
        v-if="logoUrl"
        class="animate-slide-up my-8 delay-100"
      >
        <img
          :src="logoUrl"
          :alt="logo?.originalName || 'Logo'"
          class="mx-auto h-36 md:h-40 lg:h-42 w-auto"
        />
      </div>

      <div class="animate-slide-up my-8 delay-200">
        <span
          class="inline-block border border-vsg-gold-400/30 px-6 py-2 font-body font-normal uppercase tracking-widest text-vsg-gold-400"
        >
          {{ tag }}
        </span>
      </div>

      <h1
        class="animate-slide-up text-glow font-display text-7xl text-white delay-300 md:text-8xl lg:text-9xl"
      >
        {{ headline }}
      </h1>

      <p
        class="animate-slide-up mx-auto mt-8 max-w-2xl font-body text-lg font-normal text-vsg-blue-300 delay-400 md:text-xl whitespace-pre-line"
      >
        {{ description }}
      </p>

      <!-- Scroll indicator -->
      <div class="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce">
        <FontAwesomeIcon
          icon="arrow-down"
          class="text-vsg-gold-400"
        />
      </div>
    </div>
  </section>
</template>
