<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface AdminAddButtonProps {
  /**
   * Button label text
   */
  label: string;
  /**
   * FontAwesome icon name (default: 'plus')
   */
  icon?: string;
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Border style
   * - dashed: Single dashed border (default)
   * - dashed-bold: Double dashed border (border-2)
   */
  borderStyle?: 'dashed' | 'dashed-bold';
  /**
   * Full width button
   */
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<AdminAddButtonProps>(), {
  icon: 'plus',
  disabled: false,
  borderStyle: 'dashed',
  fullWidth: true,
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
  const classes = [];

  // Base classes
  classes.push('flex items-center justify-center gap-2');
  classes.push('rounded-lg transition-colors');
  classes.push('font-body text-sm');
  classes.push('text-gray-500');
  classes.push('hover:border-vsg-blue-400 hover:text-vsg-blue-600');

  // Padding based on border style
  if (props.borderStyle === 'dashed-bold') {
    classes.push('py-3');
  } else {
    classes.push('py-2');
  }

  // Border classes
  if (props.borderStyle === 'dashed-bold') {
    classes.push('border-2 border-dashed border-gray-300');
  } else {
    classes.push('border border-dashed border-gray-300');
  }

  // Full width
  if (props.fullWidth) {
    classes.push('w-full');
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
    :class="buttonClasses"
    @click="handleClick"
  >
    <FontAwesomeIcon :icon="icon" />
    {{ label }}
  </button>
</template>
