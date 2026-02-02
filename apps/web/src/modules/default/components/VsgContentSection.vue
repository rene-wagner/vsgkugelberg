<script setup lang="ts">
interface Props {
  maxWidth?: '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: '4xl',
});

const maxWidthClasses: Record<string, string> = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};
</script>

<template>
  <section class="bg-white py-16">
    <div
      class="mx-auto px-6"
      :class="maxWidthClasses[props.maxWidth]"
    >
      <slot />
    </div>
  </section>
</template>
