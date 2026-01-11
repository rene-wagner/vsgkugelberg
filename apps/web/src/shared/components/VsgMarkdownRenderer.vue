<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

interface Props {
  content: string | null | undefined;
}

const props = defineProps<Props>();

const renderedHtml = computed(() => {
  if (!props.content) {
    return '';
  }

  return marked.parse(props.content, {
    gfm: true,
    breaks: true,
  }) as string;
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-if="renderedHtml" class="markdown-content" v-html="renderedHtml"></div>
</template>

<style scoped>
.markdown-content {
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--color-vsg-blue-700);
}

.markdown-content :deep(h1) {
  font-family: var(--font-display);
  font-size: 2.25rem;
  letter-spacing: 0.05em;
  color: var(--color-vsg-blue-900);
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.markdown-content :deep(h2) {
  font-family: var(--font-display);
  font-size: 1.875rem;
  letter-spacing: 0.05em;
  color: var(--color-vsg-blue-900);
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-content :deep(h3) {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  color: var(--color-vsg-blue-900);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h4) {
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: 0.05em;
  color: var(--color-vsg-blue-900);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
  color: var(--color-vsg-blue-700);
}

.markdown-content :deep(a) {
  color: var(--color-vsg-blue-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.markdown-content :deep(a:hover) {
  color: var(--color-vsg-gold-500);
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: var(--color-vsg-blue-900);
}

.markdown-content :deep(ul) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  list-style-type: disc;
  color: var(--color-vsg-blue-700);
}

.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  margin-left: 1.5rem;
  list-style-type: decimal;
  color: var(--color-vsg-blue-700);
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(li::marker) {
  color: var(--color-vsg-gold-500);
}

.markdown-content :deep(blockquote) {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 4px solid var(--color-vsg-gold-500);
  font-style: italic;
  color: var(--color-vsg-blue-600);
}

.markdown-content :deep(code) {
  background: var(--color-vsg-blue-100);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
  color: var(--color-vsg-blue-800);
}

.markdown-content :deep(pre) {
  margin: 1rem 0;
  padding: 1rem;
  overflow-x: auto;
  border-radius: 0.5rem;
  background: var(--color-vsg-blue-900);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--color-vsg-blue-100);
}

.markdown-content :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--color-vsg-blue-200);
}
</style>
