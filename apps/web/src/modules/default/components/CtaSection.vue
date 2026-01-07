<script setup lang="ts">
import VsgButton from '@shared/components/VsgButton.vue';

interface Props {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  theme?: 'gold' | 'white';
}

withDefaults(defineProps<Props>(), {
  title: 'WERDE TEIL DER<br />VSG FAMILIE',
  description:
    'Egal ob aktiver Sportler, Unterstützer oder Förderer – bei uns findet jeder seinen Platz. Gemeinsam sind wir stärker.',
  primaryButtonText: 'MITGLIED WERDEN',
  primaryButtonLink: '/verein/mitgliedschaft',
  secondaryButtonText: 'KONTAKT',
  secondaryButtonLink: '/contact',
  theme: 'gold',
});
</script>

<template>
  <section
    class="relative overflow-hidden py-32 text-center px-6"
    :class="theme === 'white' ? 'bg-white' : ''"
  >
    <div
      v-if="theme === 'gold'"
      class="absolute inset-0 bg-linear-to-r from-vsg-gold-600 via-vsg-gold-400 to-vsg-gold-300"
    />

    <div class="relative z-10 mx-auto max-w-4xl">
      <h3
        class="font-display leading-tight tracking-wider text-vsg-blue-900 uppercase mb-8"
        :class="
          theme === 'white'
            ? 'text-4xl md:text-6xl'
            : 'text-5xl md:text-7xl lg:text-8xl'
        "
        v-html="title"
      ></h3>
      <p
        v-if="description"
        class="mx-auto mt-6 max-w-2xl font-body text-xl font-normal text-vsg-blue-800"
      >
        {{ description }}
      </p>
      <div
        class="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
      >
        <VsgButton
          variant="secondary"
          size="lg"
          :glow="true"
          is-router
          :to="primaryButtonLink"
        >
          {{ primaryButtonText }}
        </VsgButton>
        <VsgButton
          v-if="secondaryButtonText && secondaryButtonLink"
          variant="outline"
          size="lg"
          is-router
          :to="secondaryButtonLink"
          class="!border-vsg-blue-900 !text-vsg-blue-900 hover:!bg-vsg-blue-900/10"
        >
          {{ secondaryButtonText }}
        </VsgButton>
      </div>
    </div>
  </section>
</template>
