<script setup lang="ts">
export interface TabDefinition {
  id: string;
  label: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

defineProps<{
  tabs: TabDefinition[];
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', id: string): void;
}>();

function handleTabClick(tab: TabDefinition) {
  if (!tab.disabled) {
    emit('update:activeTab', tab.id);
  }
}
</script>

<template>
  <div class="border-b border-gray-200 mb-6">
    <nav class="flex gap-6 -mb-px">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="[
          'py-3 px-1 border-b-2 font-display text-sm tracking-wider transition-colors whitespace-nowrap',
          activeTab === tab.id
            ? 'border-vsg-blue-600 text-vsg-blue-600'
            : tab.disabled
              ? 'border-transparent text-gray-300 cursor-not-allowed'
              : 'border-transparent text-gray-500 hover:text-vsg-blue-600 hover:border-gray-300',
        ]"
        :disabled="tab.disabled"
        :title="
          tab.disabled && tab.disabledTooltip ? tab.disabledTooltip : undefined
        "
        @click="handleTabClick(tab)"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>
