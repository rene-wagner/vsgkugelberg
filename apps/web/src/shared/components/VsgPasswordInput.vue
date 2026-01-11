<script setup lang="ts">
import { ref, computed } from 'vue';

type Variant = 'auth' | 'admin';

interface Props {
  id: string;
  modelValue: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minlength?: number;
  variant?: Variant;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: '********',
  required: false,
  minlength: undefined,
  variant: 'auth',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isVisible = ref(false);

const inputType = computed(() => (isVisible.value ? 'text' : 'password'));

const ariaLabel = computed(() => (isVisible.value ? 'Passwort verbergen' : 'Passwort anzeigen'));

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

// Styling classes based on variant
const labelClasses = computed(() => {
  const base = 'block font-body font-normal text-sm tracking-wider uppercase mb-2';
  return props.variant === 'auth' ? `${base} text-vsg-gold-400` : `${base} text-vsg-blue-600 text-xs`;
});

const inputClasses = computed(() => {
  const base = 'form-input-custom w-full px-4 py-3 rounded-lg focus:outline-none pr-12';
  return props.variant === 'auth'
    ? `${base} bg-vsg-blue-800/50 border border-vsg-gold-400/30 text-white placeholder-vsg-blue-300 focus:border-vsg-gold-400`
    : `${base} bg-white border border-gray-300 text-vsg-blue-900 placeholder-gray-400 text-sm py-2.5 focus:border-vsg-blue-600`;
});

const toggleClasses = computed(() => {
  const base = 'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors focus:outline-none focus:ring-2';
  return props.variant === 'auth'
    ? `${base} text-vsg-gold-400/70 hover:text-vsg-gold-400 focus:ring-vsg-gold-400/50`
    : `${base} text-gray-400 hover:text-gray-600 focus:ring-vsg-blue-400/50`;
});
</script>

<template>
  <div>
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <slot name="label-suffix" />
    </label>
    <div class="relative">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :required="required"
        :minlength="minlength"
        :placeholder="placeholder"
        :class="inputClasses"
        @input="handleInput"
      />
      <button type="button" :class="toggleClasses" :aria-label="ariaLabel" @click="toggleVisibility">
        <FontAwesomeIcon v-if="isVisible" icon="eye" />
        <FontAwesomeIcon v-else icon="eye-slash" />
      </button>
    </div>
  </div>
</template>
