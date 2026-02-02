<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface VsgAlertProps {
  /**
   * Alert visual variant
   * - success: Green background for success messages
   * - error: Red background for error messages
   * - warning: Yellow background for warning messages
   * - info: Blue background for informational messages
   */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /**
   * Alert message text. Can also use default slot for custom content.
   */
  message?: string;
  /**
   * Whether the alert can be dismissed with a close button
   */
  dismissible?: boolean;
  /**
   * Auto-dismiss timer in milliseconds. Set to 0 or false to disable.
   * @example :auto-dismiss="5000" // Dismiss after 5 seconds
   */
  autoDismiss?: number | false;
  /**
   * Whether to show the variant-specific icon
   */
  showIcon?: boolean;
}

const props = withDefaults(defineProps<VsgAlertProps>(), {
  variant: 'info',
  dismissible: false,
  autoDismiss: false,
  showIcon: false,
});

const emit = defineEmits<{
  dismiss: [];
}>();

const isVisible = ref(true);
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

const clearTimer = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
};

const handleDismiss = () => {
  clearTimer();
  isVisible.value = false;
  emit('dismiss');
};

const startAutoDismiss = () => {
  if (props.autoDismiss && props.autoDismiss > 0) {
    clearTimer();
    dismissTimer = setTimeout(() => {
      handleDismiss();
    }, props.autoDismiss);
  }
};

// Start auto-dismiss timer on mount
onMounted(() => {
  startAutoDismiss();
});

// Clean up timer on unmount
onUnmounted(() => {
  clearTimer();
});

// Reset visibility and timer when message changes (for reuse)
watch(
  () => props.message,
  () => {
    isVisible.value = true;
    startAutoDismiss();
  },
);

/**
 * Get the FontAwesome icon name for the current variant
 */
const alertIcon = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'info':
    default:
      return 'info-circle';
  }
});

/**
 * Compute container classes based on variant
 */
const containerClasses = computed(() => {
  const classes = ['rounded-xl', 'p-4', 'flex', 'items-start', 'gap-3'];

  // Add justify-between only when dismissible for proper button alignment
  if (props.dismissible) {
    classes.push('justify-between');
  }

  // Variant-specific colors
  switch (props.variant) {
    case 'success':
      classes.push('bg-green-50', 'border', 'border-green-200');
      break;
    case 'error':
      classes.push('bg-red-50', 'border', 'border-red-200');
      break;
    case 'warning':
      classes.push('bg-yellow-50', 'border', 'border-yellow-200');
      break;
    case 'info':
    default:
      classes.push('bg-blue-50', 'border', 'border-blue-200');
      break;
  }

  return classes.join(' ');
});

/**
 * Compute text classes based on variant
 */
const textClasses = computed(() => {
  const classes = ['font-body'];

  switch (props.variant) {
    case 'success':
      classes.push('text-green-600');
      break;
    case 'error':
      classes.push('text-red-600');
      break;
    case 'warning':
      classes.push('text-yellow-600');
      break;
    case 'info':
    default:
      classes.push('text-blue-600');
      break;
  }

  return classes.join(' ');
});

/**
 * Compute icon classes based on variant
 */
const iconClasses = computed(() => {
  const classes = ['flex-shrink-0'];

  switch (props.variant) {
    case 'success':
      classes.push('text-green-500');
      break;
    case 'error':
      classes.push('text-red-500');
      break;
    case 'warning':
      classes.push('text-yellow-500');
      break;
    case 'info':
    default:
      classes.push('text-blue-500');
      break;
  }

  return classes.join(' ');
});

/**
 * Compute dismiss button classes based on variant
 */
const dismissButtonClasses = computed(() => {
  const classes = ['flex-shrink-0', 'transition-colors'];

  switch (props.variant) {
    case 'success':
      classes.push('text-green-600', 'hover:text-green-800');
      break;
    case 'error':
      classes.push('text-red-600', 'hover:text-red-800');
      break;
    case 'warning':
      classes.push('text-yellow-600', 'hover:text-yellow-800');
      break;
    case 'info':
    default:
      classes.push('text-blue-600', 'hover:text-blue-800');
      break;
  }

  return classes.join(' ');
});
</script>

<template>
  <div
    v-if="isVisible"
    :class="containerClasses"
    role="alert"
  >
    <div class="flex items-center gap-3 flex-1">
      <FontAwesomeIcon
        v-if="showIcon"
        :icon="alertIcon"
        :class="iconClasses"
      />
      <p
        v-if="message"
        :class="textClasses"
      >
        {{ message }}
      </p>
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      :class="dismissButtonClasses"
      aria-label="Schließen"
      @click="handleDismiss"
    >
      <FontAwesomeIcon icon="xmark" />
    </button>
  </div>
</template>
