<script setup lang="ts">
import { computed } from 'vue';

interface VsgInputProps {
  id: string;
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'range';
  variant?: 'form' | 'inline' | 'compact';
  required?: boolean;
  disabled?: boolean;
  maxlength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  error?: string;
}

const props = withDefaults(defineProps<VsgInputProps>(), {
  type: 'text',
  variant: 'form',
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const inputClasses = computed(() => {
  const baseClasses = 'w-full';
  const errorClasses = props.error ? 'border-red-500' : '';

  switch (props.variant) {
    case 'form':
      return `form-input-custom ${baseClasses} px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 ${errorClasses}`;
    case 'inline':
      return `${baseClasses} px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 ${errorClasses}`;
    case 'compact':
      return props.error
        ? `${baseClasses} px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-body text-sm ${errorClasses}`
        : `${baseClasses} px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vsg-blue-500/20 focus:border-vsg-blue-500 transition-all font-body text-sm`;
    default:
      return baseClasses;
  }
});

const labelClasses = computed(() => {
  switch (props.variant) {
    case 'form':
      return 'block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2';
    case 'inline':
    case 'compact':
      return 'block font-body text-xs text-gray-500 uppercase tracking-wider mb-1';
    default:
      return 'block';
  }
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' || props.type === 'range' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
};
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="labelClasses"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
        >*</span
      >
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      @input="handleInput"
    />
    <p
      v-if="error"
      class="mt-1 text-xs text-red-600 font-body"
    >
      {{ error }}
    </p>
  </div>
</template>
