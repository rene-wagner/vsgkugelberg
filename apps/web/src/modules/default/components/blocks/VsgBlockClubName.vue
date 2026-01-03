<script setup lang="ts">
/**
 * VsgBlockClubName - Club branding block component
 *
 * Renders the VSG Kugelberg sports club branding including tagline,
 * club name (primary and secondary), and slogan with optional highlight.
 * Supports configurable animations and conditional rendering.
 *
 * Props:
 * - tagline: Upper label text (default: "Sportverein seit 1920")
 * - clubNamePrimary: Main heading text (default: "VSG")
 * - clubNameSecondary: Secondary heading text (default: "KUGELBERG")
 * - slogan: Paragraph text (default: "Tradition trifft Leidenschaft...")
 * - sloganHighlight: Highlighted portion of slogan (default: "Dein Verein. Deine Heimat.")
 * - animate: Enable/disable slide-up animations (default: true)
 * Events: None
 * Slots: None
 */
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    tagline?: string;
    clubNamePrimary?: string;
    clubNameSecondary?: string;
    slogan?: string;
    sloganHighlight?: string;
    animate?: boolean;
  }>(),
  {
    tagline: 'Sportverein seit 1920',
    clubNamePrimary: 'VSG',
    clubNameSecondary: 'KUGELBERG',
    slogan: 'Tradition trifft Leidenschaft. Gemeinsam stark in Weißenfels.',
    sloganHighlight: 'Dein Verein. Deine Heimat.',
    animate: true,
  },
);

const animationClass = computed(() =>
  props.animate ? 'animate-slide-up' : '',
);
</script>

<template>
  <div class="text-center">
    <!-- Tagline -->
    <div v-if="tagline" :class="animationClass">
      <span
        class="mb-6 inline-block border border-vsg-gold-400/30 px-6 py-2 font-body text-sm font-normal uppercase tracking-[0.5em] text-vsg-gold-400"
      >
        {{ tagline }}
      </span>
    </div>

    <!-- Primary Club Name -->
    <h1
      v-if="clubNamePrimary"
      :class="[
        'text-glow font-display text-[8rem] leading-[0.85] tracking-tight text-white md:text-[12rem] lg:text-[16rem]',
        animationClass,
        { 'delay-200': animate },
      ]"
    >
      {{ clubNamePrimary }}
    </h1>

    <!-- Secondary Club Name -->
    <h2
      v-if="clubNameSecondary"
      :class="[
        'font-display text-[4rem] leading-[0.9] tracking-[0.15em] text-vsg-gold-400 md:text-[6rem] lg:text-[8rem]',
        animationClass,
        { 'delay-300': animate },
      ]"
    >
      {{ clubNameSecondary }}
    </h2>

    <!-- Slogan -->
    <p
      v-if="slogan"
      :class="[
        'mx-auto mt-8 max-w-2xl font-body text-lg font-normal leading-relaxed text-vsg-blue-200 md:text-xl',
        animationClass,
        { 'delay-400': animate },
      ]"
    >
      {{ slogan }}
      <span v-if="sloganHighlight" class="mt-2 block text-vsg-gold-400">
        {{ sloganHighlight }}
      </span>
    </p>
  </div>
</template>
