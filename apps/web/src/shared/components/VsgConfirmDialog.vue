<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Bestätigung',
  message: 'Möchtest du diese Aktion wirklich durchführen?',
  confirmText: 'Bestätigen',
  cancelText: 'Abbrechen',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  },
);

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue);
});

function handleConfirm() {
  emit('confirm');
  isOpen.value = false;
}

function handleCancel() {
  isOpen.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-modal="true"
      >
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="handleCancel"
        />

        <div
          class="relative bg-vsg-blue-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-vsg-gold-400/20"
        >
          <div class="flex items-start justify-between mb-4">
            <h3
              id="dialog-title"
              class="text-lg font-display tracking-wider text-white"
            >
              {{ title }}
            </h3>
            <button
              type="button"
              class="text-vsg-blue-300 hover:text-white transition-colors"
              aria-label="Dialog schließen"
              @click="handleCancel"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p class="text-sm text-vsg-blue-200 mb-6">
            {{ message }}
          </p>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              class="px-4 py-2 border border-vsg-gold-400/30 text-vsg-gold-400 rounded-lg hover:bg-vsg-gold-400/10 transition-colors font-display text-sm tracking-wider"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-vsg-gold-400 text-vsg-blue-900 rounded-lg hover:bg-vsg-gold-300 transition-colors font-display text-sm tracking-wider"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
