<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface AdminButtonProps {
  /**
   * Button visual variant
   * - primary: Blue background (Speichern, Erstellen)
   * - secondary: Gray border outline (Abbrechen)
   * - danger: Red for delete actions (Löschen)
   * - danger-outline: Red border outline
   * - gold: Gold background for add/create actions (Hinzufügen)
   * - ghost: No background, minimal style
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-outline' | 'gold' | 'ghost';
  /**
   * Button size
   * - small: px-4 py-2
   * - medium: px-6 py-2.5 (default)
   * - large: px-8 py-2.5
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Whether button is in loading state
   */
  loading?: boolean;
  /**
   * FontAwesome icon name (e.g., 'plus', 'trash', 'pen-to-square')
   */
  icon?: string;
  /**
   * Icon position relative to text
   */
  iconPosition?: 'left' | 'right';
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<AdminButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  fullWidth: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const buttonClasses = computed(() => {
  const classes = [];

  // Base classes
  classes.push('inline-flex items-center justify-center gap-2');
  classes.push('rounded-lg transition-colors');
  classes.push('focus:outline-none focus:ring-2 focus:ring-offset-2');

  // Size classes
  switch (props.size) {
    case 'small':
      classes.push('px-4 py-2 text-sm');
      break;
    case 'large':
      classes.push('px-8 py-2.5 text-sm');
      break;
    case 'medium':
    default:
      classes.push('px-6 py-2.5 text-sm');
      break;
  }

  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push('bg-vsg-blue-600 text-white font-display tracking-wider');
      classes.push('hover:bg-vsg-blue-700 focus:ring-vsg-blue-500');
      break;
    case 'secondary':
      classes.push('border border-gray-300 text-gray-600 font-body');
      classes.push('hover:bg-gray-50 focus:ring-gray-500');
      break;
    case 'danger':
      classes.push('bg-red-600 text-white font-body');
      classes.push('hover:bg-red-700 focus:ring-red-500');
      break;
    case 'danger-outline':
      classes.push('border border-red-300 text-red-600 font-body');
      classes.push('hover:bg-red-50 focus:ring-red-500');
      break;
    case 'gold':
      classes.push('bg-vsg-gold-400 text-vsg-blue-900 font-display tracking-wider');
      classes.push('hover:bg-vsg-gold-300 focus:ring-vsg-gold-500');
      break;
    case 'ghost':
      classes.push('text-gray-600 font-body');
      classes.push('hover:bg-gray-100 focus:ring-gray-500');
      break;
  }

  // Full width
  if (props.fullWidth) {
    classes.push('w-full');
  }

  // Disabled state
  if (props.disabled || props.loading) {
    classes.push('opacity-50 cursor-not-allowed');
  }

  return classes.join(' ');
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <FontAwesomeIcon
      v-if="loading"
      icon="spinner"
      class="animate-spin"
    />
    <FontAwesomeIcon
      v-else-if="icon && iconPosition === 'left'"
      :icon="icon"
    />
    <slot></slot>
    <FontAwesomeIcon
      v-if="!loading && icon && iconPosition === 'right'"
      :icon="icon"
    />
  </button>
</template>
