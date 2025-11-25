<script setup lang="ts">
import { MdEditor, type ToolbarNames } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// Limited toolbar with essential markdown features only
const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'codeRow',
  'code',
  '-',
  'link',
  'image',
  '=',
  'revoke',
  'next',
];

const handleChange = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<template>
  <div class="vsg-markdown-editor">
    <MdEditor
      :model-value="modelValue"
      :toolbars="toolbars"
      :placeholder="placeholder"
      :disabled="disabled"
      language="en-US"
      :preview="false"
      :no-mermaid="true"
      :no-katex="true"
      :no-highlight="false"
      @update:model-value="handleChange"
    />
  </div>
</template>

<style scoped>
.vsg-markdown-editor {
  width: 100%;
}

.vsg-markdown-editor :deep(.md-editor) {
  --md-bk-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.vsg-markdown-editor :deep(.md-editor:focus-within) {
  border-color: #00295e;
  box-shadow: 0 0 0 2px rgba(0, 41, 94, 0.1);
}

.vsg-markdown-editor :deep(.md-editor-toolbar) {
  border-bottom: 1px solid #e5e7eb;
}

.vsg-markdown-editor :deep(.md-editor-input-wrapper) {
  min-height: 200px;
}
</style>
