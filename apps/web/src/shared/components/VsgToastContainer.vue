<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useToast } from '@shared/composables/useToast';

const { toasts, remove } = useToast();

const typeClasses = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-yellow-500 border-yellow-600',
  info: 'bg-blue-500 border-blue-600',
};
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['px-4 py-3 rounded-lg shadow-lg text-white font-display tracking-wider transition-all duration-300', typeClasses[toast.type]]"
        role="alert"
        aria-live="polite"
      >
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm">{{ toast.message }}</span>
          <button
            class="ml-2 hover:opacity-80 transition-opacity"
            aria-label="Close notification"
            @click="remove(toast.id)"
          >
            <FontAwesomeIcon icon="xmark" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
