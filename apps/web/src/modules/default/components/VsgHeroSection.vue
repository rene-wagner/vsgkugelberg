<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Props {
  // Content
  headline?: string;
  description?: string;
  subtitle?: string;
  tag?: string;

  // Visual elements
  logo?: { path: string; originalName: string } | null;
  iconUrl?: string;

  // Layout
  minHeight?: 'screen' | '70vh' | '80vh';

  // CTA buttons
  primaryCtaLabel?: string;
  primaryCtaAnchor?: string;
  secondaryCtaLabel?: string;
  secondaryCtaAnchor?: string;

  // UI elements
  showScrollIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  headline: '',
  description: undefined,
  subtitle: undefined,
  tag: undefined,
  logo: null,
  iconUrl: undefined,
  minHeight: 'screen',
  primaryCtaLabel: undefined,
  primaryCtaAnchor: undefined,
  secondaryCtaLabel: undefined,
  secondaryCtaAnchor: undefined,
  showScrollIndicator: false,
});

const logoUrl = computed(() => {
  if (!props.logo) return null;
  return props.logo.path;
});

const minHeightClass = computed(() => {
  switch (props.minHeight) {
    case '70vh':
      return 'min-h-[70vh]';
    case '80vh':
      return 'min-h-[80vh]';
    default:
      return 'min-h-screen';
  }
});

const hasCtaButtons = computed(() => {
  return (props.primaryCtaLabel && props.primaryCtaAnchor) || (props.secondaryCtaLabel && props.secondaryCtaAnchor);
});

function handleAnchorClick(e: MouseEvent, anchor: string) {
  if (anchor.startsWith('#')) {
    const target = document.querySelector(anchor);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', anchor);
    }
  }
}
</script>

<template>
  <section
    class="relative flex items-center justify-center overflow-hidden pt-20"
    :class="minHeightClass"
  >
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-linear-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent" />

    <!-- Decorative elements -->
    <div class="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-vsg-gold-400/10 blur-3xl" />
    <div class="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-vsg-blue-500/20 blur-3xl" />

    <!-- Optional background icon -->
    <div
      v-if="iconUrl"
      class="absolute right-10 top-1/2 -translate-y-1/2 opacity-7"
    >
      <img
        :src="iconUrl"
        alt=""
        class="h-125 w-125 object-contain"
      />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
      <!-- Logo -->
      <div
        v-if="logoUrl"
        class="animate-slide-up my-8 delay-100"
      >
        <img
          :src="logoUrl"
          :alt="logo?.originalName || 'Logo'"
          class="mx-auto h-36 w-auto md:h-40 lg:h-42"
        />
      </div>

      <!-- Tag badge -->
      <div
        v-if="tag"
        class="animate-slide-up my-8 delay-200"
      >
        <span class="inline-block border border-vsg-gold-400/30 px-6 py-2 font-body font-normal uppercase tracking-widest text-vsg-gold-400">
          {{ tag }}
        </span>
      </div>

      <!-- Headline -->
      <h1
        class="animate-slide-up text-glow font-display text-7xl text-white delay-300 md:text-8xl lg:text-9xl"
        :class="{ 'text-[5rem] leading-[0.85] tracking-tight md:text-[8rem] lg:text-[10rem]': iconUrl }"
      >
        {{ headline }}
      </h1>

      <!-- Description with optional subtitle -->
      <p
        v-if="description || subtitle"
        class="animate-slide-up mx-auto mt-8 max-w-2xl whitespace-pre-line font-body text-lg font-normal text-vsg-blue-300 delay-400 md:text-xl"
        :class="{ 'leading-relaxed text-vsg-blue-200': subtitle }"
      >
        {{ description }}
        <span
          v-if="subtitle"
          class="mt-2 block text-vsg-gold-400"
        >
          {{ subtitle }}
        </span>
      </p>

      <!-- CTA buttons -->
      <div
        v-if="hasCtaButtons"
        class="animate-slide-up mt-12 flex flex-col items-center justify-center gap-6 delay-400 sm:flex-row"
      >
        <a
          v-if="primaryCtaLabel && primaryCtaAnchor"
          :href="primaryCtaAnchor"
          class="btn-primary gold-glow bg-vsg-gold-400 px-10 py-4 font-display text-2xl tracking-wider text-vsg-blue-900"
          @click="handleAnchorClick($event, primaryCtaAnchor)"
        >
          {{ primaryCtaLabel }}
        </a>
        <a
          v-if="secondaryCtaLabel && secondaryCtaAnchor"
          :href="secondaryCtaAnchor"
          class="border-2 border-vsg-gold-400/50 px-10 py-4 font-display text-2xl tracking-wider text-vsg-gold-400 transition-colors hover:bg-vsg-gold-400/10"
          @click="handleAnchorClick($event, secondaryCtaAnchor)"
        >
          {{ secondaryCtaLabel }}
        </a>
      </div>

      <!-- Scroll indicator -->
      <div
        v-if="showScrollIndicator"
        class="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <FontAwesomeIcon
          icon="arrow-down"
          class="text-vsg-gold-400"
        />
      </div>
    </div>
  </section>
</template>
