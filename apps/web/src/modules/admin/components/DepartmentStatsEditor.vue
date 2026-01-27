<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useDepartmentStatsStore } from '../stores/departmentStatsStore';
import DepartmentStatRow from './DepartmentStatRow.vue';
import AdminButton from './AdminButton.vue';
import AdminAddButton from './AdminAddButton.vue';
import type { DepartmentStat, CreateDepartmentStatDto, UpdateDepartmentStatDto } from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  departmentSlug: string;
  initialStats: DepartmentStat[];
}>();

const statsStore = useDepartmentStatsStore();

// Local state for editing
const localStats = ref<DepartmentStat[]>([]);
const sortableIds = ref<number[]>([]);
const pendingCreates = ref<Array<{ tempId: number; label: string; value: string }>>([]);
const pendingUpdates = ref<Map<number, { label: string; value: string }>>(new Map());
const pendingDeletes = ref<Set<number>>(new Set());
const orderChanged = ref(false);

let tempIdCounter = -1; // Negative IDs for new items

// Initialize local stats from props
watch(
  () => props.initialStats,
  (newStats) => {
    localStats.value = [...newStats].sort((a, b) => a.sort - b.sort);
    sortableIds.value = localStats.value.map((s) => s.id);
    // Clear pending changes when initialStats change (e.g., after save)
    pendingCreates.value = [];
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;
  },
  { immediate: true },
);

// Computed: All items to display (existing + new, minus deleted)
const displayItems = computed({
  get: () => {
    return sortableIds.value
      .map((id) => {
        if (id < 0) {
          const item = pendingCreates.value.find((i) => i.tempId === id);
          if (!item) return null;
          return {
            id: item.tempId,
            departmentId: 0,
            label: item.label,
            value: item.value,
            sort: 0,
            createdAt: '',
            updatedAt: '',
            _isNew: true,
          };
        }
        const s = localStats.value.find((stat) => stat.id === id);
        if (!s) return null;
        const pending = pendingUpdates.value.get(s.id);
        if (pending) {
          return { ...s, label: pending.label, value: pending.value };
        }
        return s;
      })
      .filter((s): s is DepartmentStat & { _isNew?: boolean } => !!s);
  },
  set: (newItems: Array<DepartmentStat & { _isNew?: boolean }>) => {
    sortableIds.value = newItems.map((s) => s.id);
    orderChanged.value = true;
  },
});

// Check if there are any unsaved changes
const isDirty = computed(() => {
  return pendingCreates.value.length > 0 || pendingUpdates.value.size > 0 || pendingDeletes.value.size > 0 || orderChanged.value;
});

// Expose isDirty for parent component
defineExpose({ isDirty });

function handleAdd() {
  const tempId = tempIdCounter--;
  const newItem = {
    tempId,
    label: '',
    value: '',
  };
  pendingCreates.value.push(newItem);
  sortableIds.value.push(tempId);
}

function handleUpdate(id: number, data: { label: string; value: string }, isNew: boolean) {
  if (isNew) {
    // Update pending create
    const item = pendingCreates.value.find((i) => i.tempId === id);
    if (item) {
      item.label = data.label;
      item.value = data.value;
    }
  } else {
    // Track update for existing item
    const original = localStats.value.find((s) => s.id === id);
    if (original) {
      // Only track if actually changed from original
      if (original.label !== data.label || original.value !== data.value) {
        pendingUpdates.value.set(id, data);
      } else {
        pendingUpdates.value.delete(id);
      }
    }
  }
}

function handleDelete(id: number, isNew: boolean) {
  if (isNew) {
    // Remove from pending creates
    pendingCreates.value = pendingCreates.value.filter((i) => i.tempId !== id);
  } else {
    // Mark for deletion
    pendingDeletes.value.add(id);
    // Remove any pending updates for this item
    pendingUpdates.value.delete(id);
  }
  sortableIds.value = sortableIds.value.filter((sid) => sid !== id);
}

function handleDragEnd() {
  orderChanged.value = true;
}

const isSaving = ref(false);
const saveError = ref<string | null>(null);

async function handleSave() {
  if (!isDirty.value) return;

  isSaving.value = true;
  saveError.value = null;

  try {
    // 1. Delete items
    for (const id of pendingDeletes.value) {
      const success = await statsStore.deleteStat(props.departmentSlug, id);
      if (!success) {
        throw new Error('Fehler beim Löschen einer Statistik');
      }
    }

    // 2. Create new items
    for (const item of pendingCreates.value) {
      if (!item.label.trim() || !item.value.trim()) continue; // Skip empty items

      const createDto: CreateDepartmentStatDto = {
        label: item.label,
        value: item.value,
      };
      const result = await statsStore.createStat(props.departmentSlug, createDto);
      if (!result) {
        throw new Error('Fehler beim Erstellen einer Statistik');
      }

      // Update sortableIds with the real ID
      const idx = sortableIds.value.indexOf(item.tempId);
      if (idx !== -1) {
        sortableIds.value[idx] = result.id;
      }
    }

    // 3. Update existing items
    for (const [id, data] of pendingUpdates.value) {
      const updateDto: UpdateDepartmentStatDto = {
        label: data.label,
        value: data.value,
      };
      const result = await statsStore.updateStat(props.departmentSlug, id, updateDto);
      if (!result) {
        throw new Error('Fehler beim Aktualisieren einer Statistik');
      }
    }

    // 4. Reorder if changed
    if (orderChanged.value) {
      // Get current order of existing (non-deleted) items
      const existingIds = sortableIds.value.filter((id) => id > 0);

      if (existingIds.length > 0) {
        const result = await statsStore.reorder(props.departmentSlug, existingIds);
        if (!result) {
          throw new Error('Fehler beim Sortieren der Statistiken');
        }
      }
    }

    // Reset pending state
    pendingCreates.value = [];
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;

    // Refresh local stats from store
    localStats.value = [...statsStore.stats];
    sortableIds.value = localStats.value.map((s) => s.id);
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Error Message -->
    <div
      v-if="saveError"
      class="bg-red-50 border border-red-200 rounded-xl p-4"
    >
      <p class="text-sm text-red-600 font-body">{{ saveError }}</p>
    </div>

    <!-- Empty State -->
    <div
      v-if="displayItems.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <FontAwesomeIcon
        icon="chart-simple"
        size="2x"
        class="mb-4 text-gray-400"
      />
      <p class="text-gray-500 font-body mb-4">Noch keine Statistiken vorhanden.</p>
      <AdminButton
        variant="gold"
        @click="handleAdd"
      >
        Erste Statistik hinzufügen
      </AdminButton>
    </div>

    <!-- Stats List with Drag & Drop -->
    <template v-else>
      <VueDraggable
        v-model="displayItems"
        :animation="200"
        handle=".drag-handle"
        ghost-class="opacity-50"
        class="space-y-2"
        @end="handleDragEnd"
      >
        <DepartmentStatRow
          v-for="item in displayItems"
          :key="item.id"
          :stat="item"
          :is-new="'_isNew' in item"
          @update="(data) => handleUpdate(item.id, data, '_isNew' in item)"
          @delete="handleDelete(item.id, '_isNew' in item)"
        />
      </VueDraggable>

      <!-- Add Button -->
      <AdminAddButton
        label="Statistik hinzufügen"
        icon="plus"
        @click="handleAdd"
      />
    </template>

    <!-- Save Button -->
    <div
      v-if="isDirty"
      class="flex justify-end pt-4 border-t border-gray-200"
    >
      <AdminButton
        variant="primary"
        size="large"
        :loading="isSaving"
        @click="handleSave"
      >
        Speichern
      </AdminButton>
    </div>
  </div>
</template>
