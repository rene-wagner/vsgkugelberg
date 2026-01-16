<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useClickOutside, useKeyboardNav } from '@shared/composables';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface TreeOption<T = string | number> {
  id: T;
  name: string;
  children?: TreeOption<T>[];
}

interface FlattenedOption {
  value: number | string;
  label: string;
  depth: number;
}

interface Props<T extends string | number> {
  modelValue: T | null;
  options: TreeOption<T>[];
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props<string | number>>(), {
  placeholder: 'Bitte auswählen',
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null];
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const highlightedIndex = ref(-1);

useClickOutside(containerRef, () => {
  isOpen.value = false;
  highlightedIndex.value = -1;
});

function flattenOptions<T extends string | number>(options: TreeOption<T>[], depth: number = 0): FlattenedOption[] {
  const result: FlattenedOption[] = [];

  for (const option of options) {
    result.push({
      value: option.id,
      label: option.name,
      depth,
    });

    if (option.children && option.children.length > 0) {
      result.push(...flattenOptions(option.children, depth + 1));
    }
  }

  return result;
}

const flattenedOptions = computed(() => flattenOptions(props.options));

const selectedLabel = computed(() => {
  const option = flattenedOptions.value.find((opt) => opt.value === props.modelValue);
  return option ? option.label : null;
});

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  highlightedIndex.value = isOpen.value ? 0 : -1;
}

function selectOption(value: number | string | null) {
  emit('update:modelValue', value);
  isOpen.value = false;
  highlightedIndex.value = -1;
}

function getPaddingLeft(depth: number): string {
  return `${1 + depth * 1.25}rem`;
}

const keyboardNav = useKeyboardNav({
  onEscape: () => {
    isOpen.value = false;
    highlightedIndex.value = -1;
  },
  onArrowDown: () => {
    if (!isOpen.value) {
      isOpen.value = true;
      highlightedIndex.value = 0;
    } else {
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, flattenedOptions.value.length - 1);
    }
  },
  onArrowUp: () => {
    if (isOpen.value) {
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    }
  },
  onEnter: () => {
    if (isOpen.value && highlightedIndex.value >= 0) {
      selectOption(flattenedOptions.value[highlightedIndex.value].value);
    }
  },
  onHome: () => {
    if (isOpen.value) {
      highlightedIndex.value = 0;
    }
  },
  onEnd: () => {
    if (isOpen.value) {
      highlightedIndex.value = flattenedOptions.value.length - 1;
    }
  },
});

onMounted(() => {
  if (containerRef.value) {
    keyboardNav.attachToElement(containerRef.value);
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <button
      ref="triggerRef"
      type="button"
      class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:border-vsg-blue-600 transition-colors flex items-center justify-between"
      :class="{
        'cursor-not-allowed opacity-50': disabled,
        'border-vsg-blue-600': isOpen,
      }"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <span :class="selectedLabel ? 'text-vsg-blue-900' : 'text-gray-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <FontAwesomeIcon
        icon="chevron-down"
        class="w-4 h-4 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      role="listbox"
    >
      <button
        type="button"
        class="w-full px-4 py-2 text-sm text-left text-gray-500 hover:bg-gray-50 transition-colors"
        :class="{
          'bg-vsg-blue-50 text-vsg-blue-600': modelValue === null || modelValue === undefined,
        }"
        @click="selectOption(null)"
      >
        {{ placeholder }}
      </button>

      <button
        v-for="(option, index) in flattenedOptions"
        :key="option.value"
        type="button"
        class="w-full py-2 pr-4 text-sm text-left hover:bg-gray-50 transition-colors flex items-center"
        :class="[
          modelValue === option.value ? 'bg-vsg-blue-50 text-vsg-blue-600' : 'text-vsg-blue-900',
          highlightedIndex === index ? 'bg-vsg-blue-100' : '',
        ]"
        :style="{ paddingLeft: getPaddingLeft(option.depth) }"
        role="option"
        :aria-selected="modelValue === option.value"
        @click="selectOption(option.value)"
      >
        <span
          v-if="option.depth > 0"
          class="text-gray-300 mr-2"
          >└</span
        >
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
