<script setup lang="ts">
import VsgButton from '@shared/components/VsgButton.vue';
</script>

<template>
  <section class="relative overflow-hidden py-32">
    <div
      class="absolute inset-0 bg-linear-to-r from-vsg-gold-600 via-vsg-gold-400 to-vsg-gold-300"
    />

    <div class="relative z-10 mx-auto max-w-4xl px-6 text-center">
      <h3
        class="font-display text-5xl leading-tight tracking-wider text-vsg-blue-900 md:text-7xl lg:text-8xl"
      >
        WERDE TEIL DER<br />VSG FAMILIE
      </h3>
      <p
        class="mx-auto mt-6 max-w-2xl font-body text-xl font-normal text-vsg-blue-800"
      >
        Egal ob aktiver Sportler, Unterstützer oder Förderer – bei uns findet
        jeder seinen Platz. Gemeinsam sind wir stärker.
      </p>
      <div
        class="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
      >
        <VsgButton variant="secondary" size="lg" :glow="true">
          MITGLIED WERDEN
        </VsgButton>
        <button
          class="border-2 border-vsg-blue-900 px-10 py-4 font-display text-2xl tracking-wider text-vsg-blue-900 transition-colors hover:bg-vsg-blue-900/10"
        >
          KONTAKT
        </button>
      </div>
    </div>
  </section>
</template>
