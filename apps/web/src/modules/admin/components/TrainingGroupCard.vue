<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import TrainingSessionRow from './TrainingSessionRow.vue';
import type { DepartmentTrainingGroup, DepartmentTrainingSession, DepartmentLocation } from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface LocalSession extends DepartmentTrainingSession {
  _isNew?: boolean;
  _tempId?: number;
}

const props = defineProps<{
  group: DepartmentTrainingGroup & { _isNew?: boolean };
  isNew?: boolean;
  locations: DepartmentLocation[];
}>();

const emit = defineEmits<{
  (
    e: 'update',
    data: {
      name: string;
      ageRange: string;
      icon: 'youth' | 'adults';
      variant: 'primary' | 'secondary';
    },
  ): void;
  (e: 'delete'): void;
  (e: 'session-add'): void;
  (e: 'session-update', sessionId: number, data: { day: string; time: string; locationId: number | null }, isNew: boolean): void;
  (e: 'session-delete', sessionId: number, isNew: boolean): void;
  (e: 'sessions-reorder', newSessions: LocalSession[]): void;
}>();

const name = ref(props.group.name);
const ageRange = ref(props.group.ageRange || '');
const icon = ref<'youth' | 'adults'>(props.group.icon);
const variant = ref<'primary' | 'secondary'>(props.group.variant);
const isExpanded = ref(true);

const localSessions = ref<LocalSession[]>([...props.group.sessions]);

// Watch for external group changes (deep to catch session changes)
watch(
  () => props.group,
  (newGroup) => {
    name.value = newGroup.name;
    ageRange.value = newGroup.ageRange || '';
    icon.value = newGroup.icon;
    variant.value = newGroup.variant;
    localSessions.value = [...newGroup.sessions];
  },
  { deep: true },
);

// Emit updates when values change
watch([name, ageRange, icon, variant], () => {
  emit('update', {
    name: name.value,
    ageRange: ageRange.value,
    icon: icon.value,
    variant: variant.value,
  });
});

const sessionCount = computed(() => localSessions.value.length);

function handleDelete() {
  emit('delete');
}

function handleAddSession() {
  emit('session-add');
}

function handleSessionUpdate(sessionId: number, data: { day: string; time: string; locationId: number | null }, isNew: boolean) {
  emit('session-update', sessionId, data, isNew);
}

function handleSessionDelete(sessionId: number, isNew: boolean) {
  emit('session-delete', sessionId, isNew);
}

function handleSessionsDragEnd() {
  emit('sessions-reorder', localSessions.value);
}
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    :class="{ 'border-vsg-lime-500': isNew }"
  >
    <!-- Card Header -->
    <div class="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
      <!-- Drag Handle -->
      <div class="cursor-grab text-gray-400 hover:text-gray-600 group-drag-handle shrink-0">
        <FontAwesomeIcon icon="grip" />
      </div>

      <!-- Expand/Collapse Toggle -->
      <button
        type="button"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        @click="isExpanded = !isExpanded"
      >
        <FontAwesomeIcon
          icon="chevron-down"
          class="text-gray-500 transition-transform"
          :class="{ 'rotate-180': !isExpanded }"
        />
      </button>

      <!-- Group Title -->
      <div class="flex-1 min-w-0">
        <input
          v-model="name"
          type="text"
          placeholder="Gruppenname"
          class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-vsg-blue-900 font-semibold text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>

      <!-- Session Count Badge -->
      <span class="px-2 py-1 bg-vsg-blue-100 text-vsg-blue-700 text-xs font-body rounded">
        {{ sessionCount }} {{ sessionCount === 1 ? 'Termin' : 'Termine' }}
      </span>

      <!-- Delete Button -->
      <button
        type="button"
        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Trainingsgruppe löschen"
        @click="handleDelete"
      >
        <FontAwesomeIcon icon="trash" />
      </button>
    </div>

    <!-- Card Body (Collapsible) -->
    <div
      v-show="isExpanded"
      class="p-4 space-y-4"
    >
      <!-- Group Details Row -->
      <div class="grid grid-cols-3 gap-3">
        <!-- Age Range -->
        <div>
          <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"> Altersbereich </label>
          <input
            v-model="ageRange"
            type="text"
            placeholder="z.B. 6-12 Jahre (optional)"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <!-- Icon -->
        <div>
          <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"> Icon </label>
          <select
            v-model="icon"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option value="youth">Jugend</option>
            <option value="adults">Erwachsene</option>
          </select>
        </div>

        <!-- Variant -->
        <div>
          <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"> Variante </label>
          <select
            v-model="variant"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option value="primary">Primär (Blau)</option>
            <option value="secondary">Sekundär (Lime)</option>
          </select>
        </div>
      </div>

      <!-- Sessions Section -->
      <div>
        <h4 class="font-body text-xs text-gray-500 uppercase tracking-wider mb-2">Trainingszeiten</h4>

        <!-- Sessions List -->
        <div
          v-if="localSessions.length > 0"
          class="space-y-2 mb-3"
        >
          <VueDraggable
            v-model="localSessions"
            :animation="150"
            handle=".session-drag-handle"
            ghost-class="opacity-50"
            class="space-y-2"
            @end="handleSessionsDragEnd"
          >
            <TrainingSessionRow
              v-for="session in localSessions"
              :key="session.id"
              :session="session"
              :is-new="session._isNew"
              :locations="locations"
              @update="(data) => handleSessionUpdate(session._tempId || session.id, data, !!session._isNew)"
              @delete="handleSessionDelete(session._tempId || session.id, !!session._isNew)"
            />
          </VueDraggable>
        </div>

        <!-- Empty State for Sessions -->
        <div
          v-else
          class="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-3"
        >
          <p class="text-gray-500 font-body text-sm">Noch keine Trainingszeiten.</p>
        </div>

        <!-- Add Session Button -->
        <button
          type="button"
          class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-colors font-body text-sm flex items-center justify-center gap-2"
          @click="handleAddSession"
        >
          <FontAwesomeIcon icon="plus" />
          Trainingszeit hinzufügen
        </button>
      </div>
    </div>
  </div>
</template>
