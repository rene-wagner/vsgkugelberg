<script setup lang="ts">
import VsgButton from '@shared/components/VsgButton.vue';

interface Props {
  headline?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  theme?: 'gold' | 'white';
}

const props = withDefaults(defineProps<Props>(), {
  primaryButtonText: 'Mitglied werden',
  primaryButtonLink: '/verein/mitgliedschaft',
  secondaryButtonText: 'Kontakt',
  secondaryButtonLink: '/kontakt',
  theme: 'gold',
});
</script>

<template>
  <section
    class="relative overflow-hidden py-32 text-center px-6"
    :class="props.theme === 'white' ? 'bg-white' : ''"
  >
    <div
      v-if="props.theme === 'gold'"
      class="absolute inset-0 bg-linear-to-r from-vsg-gold-600 via-vsg-gold-400 to-vsg-gold-300"
    />

    <div class="relative z-10 mx-auto max-w-4xl">
      <!-- eslint-disable vue/no-v-html -->
      <h3
        class="font-display leading-tight tracking-wider text-vsg-blue-900 uppercase mb-8"
        :class="props.theme === 'white' ? 'text-4xl md:text-6xl' : 'text-5xl md:text-7xl lg:text-8xl'"
        v-html="props.headline"
      ></h3>
      <!-- eslint-enable vue/no-v-html -->
      <p
        v-if="props.description"
        class="mx-auto mt-6 max-w-2xl font-body text-xl font-normal text-vsg-blue-800"
      >
        {{ props.description }}
      </p>
      <div class="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
        <VsgButton
          variant="secondary"
          size="lg"
          :glow="true"
          is-router
          :to="props.primaryButtonLink"
        >
          {{ props.primaryButtonText }}
        </VsgButton>
        <VsgButton
          v-if="props.secondaryButtonText && props.secondaryButtonLink"
          variant="outline"
          size="lg"
          is-router
          :to="props.secondaryButtonLink"
          class="border-vsg-blue-900! text-vsg-blue-900! hover:bg-vsg-blue-900/10!"
        >
          {{ props.secondaryButtonText }}
        </VsgButton>
      </div>
    </div>
  </section>
</template>
