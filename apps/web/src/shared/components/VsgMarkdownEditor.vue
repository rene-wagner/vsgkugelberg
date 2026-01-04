<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

interface Props {
  modelValue: string;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  minHeight: '250px',
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
let easyMDE: EasyMDE | null = null;

// Track if we're updating from the editor to prevent feedback loops
let isUpdatingFromEditor = false;

function initEditor() {
  if (!textareaRef.value) return;

  easyMDE = new EasyMDE({
    element: textareaRef.value,
    initialValue: props.modelValue ?? '',
    placeholder: props.placeholder,
    minHeight: props.minHeight,
    spellChecker: false,
    status: false,
    sideBySideFullscreen: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'link',
      '|',
      'unordered-list',
      'ordered-list',
      '|',
      'preview',
      'guide',
    ],
  });

  // Set up change handler to emit updates
  easyMDE.codemirror.on('change', () => {
    if (!easyMDE) return;
    isUpdatingFromEditor = true;
    emit('update:modelValue', easyMDE.value());
    isUpdatingFromEditor = false;
  });

  // Apply disabled state if needed
  if (props.disabled) {
    easyMDE.codemirror.setOption('readOnly', true);
  }
}

function destroyEditor() {
  if (easyMDE) {
    easyMDE.toTextArea();
    easyMDE = null;
  }
}

// Watch for external value changes (not from editor)
watch(
  () => props.modelValue,
  (newValue) => {
    if (isUpdatingFromEditor || !easyMDE) return;
    const currentValue = easyMDE.value();
    const newVal = newValue ?? '';
    if (currentValue !== newVal) {
      easyMDE.value(newVal);
    }
  },
);

// Watch for disabled state changes
watch(
  () => props.disabled,
  (newDisabled) => {
    if (easyMDE) {
      easyMDE.codemirror.setOption('readOnly', newDisabled);
    }
  },
);

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  destroyEditor();
});
</script>

<template>
  <div class="vsg-markdown-editor">
    <textarea ref="textareaRef"></textarea>
  </div>
</template>

<style scoped>
.vsg-markdown-editor {
  width: 100%;
}
</style>
