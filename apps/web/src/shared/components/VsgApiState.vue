<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Props {
  isLoading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  empty: false,
  emptyMessage: 'Keine Daten vorhanden',
});
</script>

<template>
  <div class="vsg-api-state">
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <FontAwesomeIcon icon="spinner" class="animate-spin text-vsg-gold-400" />
      <span class="ml-3 text-vsg-blue-900 font-display tracking-wider">Laden...</span>
    </div>

    <div v-else-if="error" class="flex items-center justify-center py-8">
      <FontAwesomeIcon icon="triangle-exclamation" class="text-red-500" />
      <span class="ml-3 text-red-600 font-display tracking-wider">{{ error }}</span>
    </div>

    <div v-else-if="empty" class="flex items-center justify-center py-8">
      <FontAwesomeIcon icon="inbox" class="text-vsg-blue-400" />
      <span class="ml-3 text-vsg-blue-400 font-display tracking-wider">{{ emptyMessage }}</span>
    </div>

    <slot v-else />
  </div>
</template>
