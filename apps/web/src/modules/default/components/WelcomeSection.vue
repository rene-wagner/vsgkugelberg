<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

interface Props {
  welcomeText: string;
}

const props = defineProps<Props>();

const renderedHtml = computed(() => marked(props.welcomeText));
</script>

<template>
  <section class="bg-white py-20">
    <div class="mx-auto max-w-3xl px-6">
      <!-- Top gold divider -->
      <div class="flex items-center gap-4 mb-10">
        <div class="flex-1 h-px bg-vsg-gold-400"></div>
        <div class="flex gap-1.5">
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-400"></span>
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-500"></span>
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-400"></span>
        </div>
        <div class="flex-1 h-px bg-vsg-gold-400"></div>
      </div>

      <div
        class="prose prose-lg mx-auto max-w-none text-center prose-headings:font-display prose-headings:text-vsg-blue-900 prose-p:font-body prose-p:text-gray-700 prose-a:text-vsg-blue-600 prose-a:no-underline hover:prose-a:text-vsg-gold-500 prose-strong:text-vsg-blue-900 prose-li:text-gray-700"
        v-html="renderedHtml"
      />

      <!-- Bottom gold divider -->
      <div class="flex items-center gap-4 mt-10">
        <div class="flex-1 h-px bg-vsg-gold-400"></div>
        <div class="flex gap-1.5">
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-400"></span>
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-500"></span>
          <span class="block w-1.5 h-1.5 rounded-full bg-vsg-gold-400"></span>
        </div>
        <div class="flex-1 h-px bg-vsg-gold-400"></div>
      </div>
    </div>
  </section>
</template>
