<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useDepartmentTrainersStore } from '../stores/departmentTrainersStore';
import TrainerCard from './TrainerCard.vue';
import type {
  DepartmentTrainer,
  TrainerLicense,
  CreateDepartmentTrainerDto,
  UpdateDepartmentTrainerDto,
} from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface LocalTrainer extends DepartmentTrainer {
  _isNew?: boolean;
  _tempId?: number;
}

const props = defineProps<{
  departmentSlug: string;
  initialTrainers: DepartmentTrainer[];
}>();

const trainersStore = useDepartmentTrainersStore();

// Local state
const localTrainers = ref<LocalTrainer[]>([]);
const sortableIds = ref<number[]>([]);
const pendingCreates = ref<Map<number, LocalTrainer>>(new Map());
const pendingUpdates = ref<
  Map<
    number,
    {
      contactPersonId: number | null;
      role: string;
      licenses: TrainerLicense[];
    }
  >
>(new Map());
const pendingDeletes = ref<Set<number>>(new Set());
const orderChanged = ref(false);

let tempIdCounter = -1;

// Initialize from props
watch(
  () => props.initialTrainers,
  (newTrainers) => {
    localTrainers.value = [...newTrainers].sort((a, b) => a.sort - b.sort);
    sortableIds.value = localTrainers.value.map((t) => t.id);
    pendingCreates.value.clear();
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;
  },
  { immediate: true },
);

// Computed: Display trainers
const displayTrainers = computed({
  get: () => {
    return sortableIds.value
      .map((id) => {
        if (id < 0) {
          return pendingCreates.value.get(id);
        }
        const t = localTrainers.value.find((train) => train.id === id);
        if (!t) return null;
        const pending = pendingUpdates.value.get(t.id);
        return pending ? { ...t, ...pending } : t;
      })
      .filter((t): t is LocalTrainer => !!t);
  },
  set: (newItems: LocalTrainer[]) => {
    sortableIds.value = newItems.map((t) => t.id);
    orderChanged.value = true;
  },
});

// Get all used contact person IDs (for exclusion in select)
const usedContactPersonIds = computed(() => {
  const ids: number[] = [];

  // From existing trainers (not deleted)
  for (const trainer of localTrainers.value) {
    if (!pendingDeletes.value.has(trainer.id)) {
      const pending = pendingUpdates.value.get(trainer.id);
      const cpId = pending?.contactPersonId ?? trainer.contactPersonId;
      if (cpId) ids.push(cpId);
    }
  }

  // From pending creates
  for (const [, trainer] of pendingCreates.value) {
    if (trainer.contactPersonId) {
      ids.push(trainer.contactPersonId);
    }
  }

  return ids;
});

const isDirty = computed(() => {
  return (
    pendingCreates.value.size > 0 ||
    pendingUpdates.value.size > 0 ||
    pendingDeletes.value.size > 0 ||
    orderChanged.value
  );
});

defineExpose({ isDirty });

function handleAdd() {
  const tempId = tempIdCounter--;
  const newTrainer: LocalTrainer = {
    id: tempId,
    _tempId: tempId,
    _isNew: true,
    departmentId: 0,
    contactPersonId: 0,
    role: '',
    licenses: [],
    sort: localTrainers.value.length + pendingCreates.value.size,
    contactPerson: {
      id: 0,
      firstName: '',
      lastName: '',
      type: '',
      email: null,
      address: null,
      phone: '',
      profileImageId: null,
      profileImage: null,
      createdAt: '',
      updatedAt: '',
    },
    createdAt: '',
    updatedAt: '',
  };
  pendingCreates.value.set(tempId, newTrainer);
  sortableIds.value.push(tempId);
}

function handleUpdate(
  id: number,
  data: {
    contactPersonId: number | null;
    role: string;
    licenses: TrainerLicense[];
  },
  isNew: boolean,
) {
  if (isNew) {
    const trainer = pendingCreates.value.get(id);
    if (trainer) {
      trainer.contactPersonId = data.contactPersonId || 0;
      trainer.role = data.role;
      trainer.licenses = data.licenses;
    }
  } else {
    pendingUpdates.value.set(id, data);
  }
}

function handleDelete(id: number, isNew: boolean) {
  if (isNew) {
    pendingCreates.value.delete(id);
  } else {
    pendingDeletes.value.add(id);
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
    // 1. Delete trainers
    for (const id of pendingDeletes.value) {
      const success = await trainersStore.deleteTrainer(
        props.departmentSlug,
        id,
      );
      if (!success) throw new Error('Fehler beim Löschen eines Trainers');
    }

    // 2. Create new trainers
    for (const [, trainer] of pendingCreates.value) {
      if (!trainer.contactPersonId) continue; // Skip if no contact person selected

      const createDto: CreateDepartmentTrainerDto = {
        contactPersonId: trainer.contactPersonId,
        role: trainer.role,
        licenses: trainer.licenses,
      };

      const result = await trainersStore.createTrainer(
        props.departmentSlug,
        createDto,
      );
      if (!result) throw new Error('Fehler beim Erstellen eines Trainers');

      // Update sortableIds with the real ID
      const idx = sortableIds.value.indexOf(trainer.id);
      if (idx !== -1) {
        sortableIds.value[idx] = result.id;
      }
    }

    // 3. Update existing trainers
    for (const [id, data] of pendingUpdates.value) {
      const updateDto: UpdateDepartmentTrainerDto = {
        role: data.role,
        licenses: data.licenses,
      };

      const result = await trainersStore.updateTrainer(
        props.departmentSlug,
        id,
        updateDto,
      );
      if (!result) throw new Error('Fehler beim Aktualisieren eines Trainers');
    }

    // 4. Reorder if changed
    if (orderChanged.value) {
      const existingIds = sortableIds.value.filter((id) => id > 0);

      if (existingIds.length > 0) {
        const result = await trainersStore.reorder(
          props.departmentSlug,
          existingIds,
        );
        if (!result) throw new Error('Fehler beim Sortieren der Trainer');
      }
    }

    // Reset pending state
    pendingCreates.value.clear();
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;

    // Refresh from store
    localTrainers.value = [...trainersStore.trainers];
    sortableIds.value = localTrainers.value.map((t) => t.id);
  } catch (e) {
    saveError.value =
      e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
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
      v-if="displayTrainers.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <FontAwesomeIcon
        icon="people-group"
        size="2x"
        class="mb-4 text-gray-400"
      />
      <p class="text-gray-500 font-body mb-4">Noch keine Trainer vorhanden.</p>
      <button
        type="button"
        class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
        @click="handleAdd"
      >
        Ersten Trainer hinzufügen
      </button>
    </div>

    <!-- Trainers List -->
    <template v-else>
      <VueDraggable
        v-model="displayTrainers"
        :animation="200"
        handle=".trainer-drag-handle"
        ghost-class="opacity-50"
        class="space-y-4"
        @end="handleDragEnd"
      >
        <TrainerCard
          v-for="trainer in displayTrainers"
          :key="trainer.id"
          :trainer="trainer"
          :is-new="!!trainer._isNew"
          :used-contact-person-ids="usedContactPersonIds"
          @update="
            (data) =>
              handleUpdate(
                trainer._tempId || trainer.id,
                data,
                !!trainer._isNew,
              )
          "
          @delete="
            handleDelete(trainer._tempId || trainer.id, !!trainer._isNew)
          "
        />
      </VueDraggable>

      <!-- Add Button -->
      <button
        type="button"
        class="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-colors font-body text-sm flex items-center justify-center gap-2"
        @click="handleAdd"
      >
        <FontAwesomeIcon icon="plus" />
        Trainer hinzufügen
      </button>
    </template>

    <!-- Save Button -->
    <div v-if="isDirty" class="flex justify-end pt-4 border-t border-gray-200">
      <button
        type="button"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSaving"
        @click="handleSave"
      >
        {{ isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </div>
</template>
