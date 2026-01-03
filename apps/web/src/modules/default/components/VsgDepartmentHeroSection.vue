<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaAnchor?: string;
  secondaryCtaLabel?: string;
  secondaryCtaAnchor?: string;
}

defineProps<Props>();
</script>

<template>
  <section
    class="relative flex min-h-[70vh] items-center justify-center overflow-hidden pt-20"
  >
    <!-- Background gradient overlay -->
    <div
      class="absolute inset-0 bg-linear-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent"
    />

    <!-- Decorative elements -->
    <div
      class="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-vsg-gold-400/10 blur-3xl"
    />
    <div
      class="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-vsg-blue-500/20 blur-3xl"
    />

    <!-- Optional background icon slot -->
    <div class="absolute right-10 top-1/2 -translate-y-1/2 opacity-5">
      <slot name="background-icon" />
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
      <!-- Title -->
      <h1
        class="animate-slide-up text-glow font-display text-[5rem] leading-[0.85] tracking-tight text-white delay-200 md:text-[8rem] lg:text-[10rem]"
      >
        {{ title }}
      </h1>

      <!-- Description with optional subtitle -->
      <p
        v-if="description || subtitle"
        class="animate-slide-up mx-auto mt-8 max-w-2xl font-body text-lg font-normal leading-relaxed text-vsg-blue-200 delay-300 md:text-xl"
      >
        {{ description }}
        <span v-if="subtitle" class="mt-2 block text-vsg-gold-400">
          {{ subtitle }}
        </span>
      </p>

      <!-- CTA buttons -->
      <div
        v-if="primaryCtaLabel || secondaryCtaLabel"
        class="animate-slide-up mt-12 flex flex-col items-center justify-center gap-6 delay-400 sm:flex-row"
      >
        <a
          v-if="primaryCtaLabel && primaryCtaAnchor"
          :href="primaryCtaAnchor"
          class="btn-primary gold-glow bg-vsg-gold-400 px-10 py-4 font-display text-2xl tracking-wider text-vsg-blue-900"
        >
          {{ primaryCtaLabel }}
        </a>
        <a
          v-if="secondaryCtaLabel && secondaryCtaAnchor"
          :href="secondaryCtaAnchor"
          class="border-2 border-vsg-gold-400/50 px-10 py-4 font-display text-2xl tracking-wider text-vsg-gold-400 transition-colors hover:bg-vsg-gold-400/10"
        >
          {{ secondaryCtaLabel }}
        </a>
      </div>
    </div>
  </section>
</template>
