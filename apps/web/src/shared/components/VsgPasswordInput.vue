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

const ariaLabel = computed(() =>
  isVisible.value ? 'Passwort verbergen' : 'Passwort anzeigen',
);

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

// Styling classes based on variant
const labelClasses = computed(() => {
  const base =
    'block font-body font-normal text-sm tracking-wider uppercase mb-2';
  return props.variant === 'auth'
    ? `${base} text-vsg-gold-400`
    : `${base} text-vsg-blue-600 text-xs`;
});

const inputClasses = computed(() => {
  const base =
    'form-input-custom w-full px-4 py-3 rounded-lg focus:outline-none pr-12';
  return props.variant === 'auth'
    ? `${base} bg-vsg-blue-800/50 border border-vsg-gold-400/30 text-white placeholder-vsg-blue-300 focus:border-vsg-gold-400`
    : `${base} bg-white border border-gray-300 text-vsg-blue-900 placeholder-gray-400 text-sm py-2.5 focus:border-vsg-blue-600`;
});

const toggleClasses = computed(() => {
  const base =
    'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors focus:outline-none focus:ring-2';
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
      <button
        type="button"
        :class="toggleClasses"
        :aria-label="ariaLabel"
        @click="toggleVisibility"
      >
        <!-- Eye icon (visible state) -->
        <svg
          v-if="isVisible"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <!-- Eye-off icon (hidden state) -->
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
