<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface AdminIconButtonProps {
  /**
   * FontAwesome icon name (e.g., 'pen-to-square', 'trash', 'eye')
   */
  icon: string;
  /**
   * Button visual variant
   * - default: Gray icon, hover to gray-600
   * - edit: Gray icon, hover to blue-600
   * - delete: Gray icon, hover to red-500 with red background
   * - view: Gray icon, hover to blue-600
   */
  variant?: 'default' | 'edit' | 'delete' | 'view';
  /**
   * Tooltip title text
   */
  title?: string;
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Show background on hover
   */
  withBackground?: boolean;
}

const props = withDefaults(defineProps<AdminIconButtonProps>(), {
  variant: 'default',
  disabled: false,
  withBackground: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const buttonClasses = computed(() => {
  const classes = ['p-2', 'rounded-lg', 'transition-colors'];

  // Variant classes
  switch (props.variant) {
    case 'edit':
      classes.push('text-gray-400 hover:text-vsg-blue-600');
      if (props.withBackground) {
        classes.push('hover:bg-vsg-blue-50');
      }
      break;
    case 'delete':
      classes.push('text-gray-400 hover:text-red-500');
      if (props.withBackground) {
        classes.push('hover:bg-red-50');
      }
      break;
    case 'view':
      classes.push('text-gray-400 hover:text-vsg-blue-600');
      if (props.withBackground) {
        classes.push('hover:bg-vsg-blue-50');
      }
      break;
    case 'default':
    default:
      classes.push('text-gray-400 hover:text-gray-600');
      if (props.withBackground) {
        classes.push('hover:bg-gray-100');
      }
      break;
  }

  // Disabled state
  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed');
  }

  return classes.join(' ');
});
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :title="title"
    :class="buttonClasses"
    @click="handleClick"
  >
    <FontAwesomeIcon :icon="icon" />
  </button>
</template>
