<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Using `any` to allow generic tree structures without requiring index signatures
type TreeOption = Record<string, any>;

interface FlattenedOption {
  value: number | string;
  label: string;
  depth: number;
}

interface Props {
  modelValue: number | string | null | undefined;
  options: TreeOption[];
  placeholder?: string;
  disabled?: boolean;
  labelKey?: string;
  valueKey?: string;
  childrenKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Bitte auswählen',
  disabled: false,
  labelKey: 'name',
  valueKey: 'id',
  childrenKey: 'children',
});

const emit = defineEmits<{
  'update:modelValue': [value: number | string | null];
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

// Flatten tree structure for rendering with depth information
function flattenOptions(
  options: TreeOption[],
  depth: number = 0,
): FlattenedOption[] {
  const result: FlattenedOption[] = [];

  for (const option of options) {
    result.push({
      value: option[props.valueKey] as number | string,
      label: String(option[props.labelKey]),
      depth,
    });

    const children = option[props.childrenKey] as TreeOption[] | undefined;
    if (children && children.length > 0) {
      result.push(...flattenOptions(children, depth + 1));
    }
  }

  return result;
}

const flattenedOptions = computed(() => flattenOptions(props.options));

const selectedLabel = computed(() => {
  const option = flattenedOptions.value.find(
    (opt) => opt.value === props.modelValue,
  );
  return option ? option.label : null;
});

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
}

function selectOption(value: number | string | null) {
  emit('update:modelValue', value);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
}

function getPaddingLeft(depth: number): string {
  return `${1 + depth * 1.25}rem`;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger Button -->
    <button
      type="button"
      class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:border-vsg-blue-600 transition-colors flex items-center justify-between"
      :class="{
        'cursor-not-allowed opacity-50': disabled,
        'border-vsg-blue-600': isOpen,
      }"
      :disabled="disabled"
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

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      <!-- Clear/None option -->
      <button
        type="button"
        class="w-full px-4 py-2 text-sm text-left text-gray-500 hover:bg-gray-50 transition-colors"
        :class="{
          'bg-vsg-blue-50 text-vsg-blue-600':
            modelValue === null || modelValue === undefined,
        }"
        @click="selectOption(null)"
      >
        {{ placeholder }}
      </button>

      <!-- Tree Options (flattened with depth) -->
      <button
        v-for="option in flattenedOptions"
        :key="option.value"
        type="button"
        class="w-full py-2 pr-4 text-sm text-left hover:bg-gray-50 transition-colors flex items-center"
        :class="
          modelValue === option.value
            ? 'bg-vsg-blue-50 text-vsg-blue-600'
            : 'text-vsg-blue-900'
        "
        :style="{ paddingLeft: getPaddingLeft(option.depth) }"
        @click="selectOption(option.value)"
      >
        <span v-if="option.depth > 0" class="text-gray-300 mr-2">└</span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
