<script setup lang="ts">
import VsgButton from '@shared/components/VsgButton.vue';
</script>

<template>
  <section
    class="relative flex min-h-screen items-center justify-center overflow-hidden pt-20"
  >
    <!-- Background gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent"
    />

    <!-- Decorative elements -->
    <div
      class="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-vsg-gold-400/10 blur-3xl"
    />
    <div
      class="absolute bottom-1/4 left-0 h-80 w-80 rounded-full bg-vsg-blue-500/20 blur-3xl"
    />

    <div class="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
      <div class="animate-slide-up">
        <span
          class="mb-6 inline-block border border-vsg-gold-400/30 px-6 py-2 font-body text-sm font-normal uppercase tracking-[0.5em] text-vsg-gold-400"
        >
          Sportverein seit 1920
        </span>
      </div>

      <h1
        class="animate-slide-up text-glow font-display text-[8rem] leading-[0.85] tracking-tight text-white delay-200 md:text-[12rem] lg:text-[16rem]"
      >
        VSG
      </h1>

      <h2
        class="animate-slide-up font-display text-[4rem] leading-[0.9] tracking-[0.15em] text-vsg-gold-400 delay-300 md:text-[6rem] lg:text-[8rem]"
      >
        KUGELBERG
      </h2>

      <p
        class="animate-slide-up mx-auto mt-8 max-w-2xl font-body text-lg font-normal leading-relaxed text-vsg-blue-200 delay-400 md:text-xl"
      >
        Tradition trifft Leidenschaft. Gemeinsam stark in Weißenfels.
        <span class="mt-2 block text-vsg-gold-400"
          >Dein Verein. Deine Heimat.</span
        >
      </p>

      <div
        class="animate-slide-up mt-12 flex flex-col items-center justify-center gap-6 delay-500 sm:flex-row"
      >
        <VsgButton variant="primary" size="lg" :glow="true">
          JETZT BEITRETEN
        </VsgButton>
        <VsgButton variant="outline" size="lg"> MEHR ERFAHREN </VsgButton>
      </div>

      <!-- Scroll indicator -->
      <div
        class="absolute bottom-1 left-1/2 -translate-x-1/2 animate-bounce delay-700"
      >
        <svg
          class="h-8 w-8 text-vsg-gold-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  </section>
</template>
