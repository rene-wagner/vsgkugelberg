<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useDepartmentLocationsStore } from '../stores/departmentLocationsStore';
import LocationCard from './LocationCard.vue';
import type {
  DepartmentLocation,
  LocationAmenity,
  CreateDepartmentLocationDto,
  UpdateDepartmentLocationDto,
} from '../types/department-extended.types';

interface LocalLocation extends DepartmentLocation {
  _isNew?: boolean;
  _tempId?: number;
}

const props = defineProps<{
  departmentSlug: string;
  initialLocations: DepartmentLocation[];
}>();

const locationsStore = useDepartmentLocationsStore();

// Local state
const localLocations = ref<LocalLocation[]>([]);
const pendingCreates = ref<Map<number, LocalLocation>>(new Map());
const pendingUpdates = ref<
  Map<
    number,
    {
      name: string;
      badge: string;
      badgeVariant: 'primary' | 'secondary';
      street: string;
      city: string;
      mapsUrl: string;
      amenities: LocationAmenity[];
    }
  >
>(new Map());
const pendingDeletes = ref<Set<number>>(new Set());
const orderChanged = ref(false);

let tempIdCounter = -1;

// Initialize from props
watch(
  () => props.initialLocations,
  (newLocations) => {
    localLocations.value = [...newLocations].sort((a, b) => a.sort - b.sort);
    pendingCreates.value.clear();
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;
  },
  { immediate: true },
);

// Computed: Display locations
const displayLocations = computed(() => {
  const existing = localLocations.value
    .filter((l) => !pendingDeletes.value.has(l.id))
    .map((l) => {
      const pending = pendingUpdates.value.get(l.id);
      return pending ? { ...l, ...pending } : l;
    });

  const newLocations = Array.from(pendingCreates.value.values());

  return [...existing, ...newLocations];
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
  const newLocation: LocalLocation = {
    id: tempId,
    _tempId: tempId,
    _isNew: true,
    departmentId: 0,
    name: '',
    badge: '',
    badgeVariant: 'primary',
    street: '',
    city: '',
    mapsUrl: '',
    amenities: [],
    sort: localLocations.value.length + pendingCreates.value.size,
    createdAt: '',
    updatedAt: '',
  };
  pendingCreates.value.set(tempId, newLocation);
}

function handleUpdate(
  id: number,
  data: {
    name: string;
    badge: string;
    badgeVariant: 'primary' | 'secondary';
    street: string;
    city: string;
    mapsUrl: string;
    amenities: LocationAmenity[];
  },
  isNew: boolean,
) {
  if (isNew) {
    const location = pendingCreates.value.get(id);
    if (location) {
      Object.assign(location, data);
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
    // 1. Delete locations
    for (const id of pendingDeletes.value) {
      const success = await locationsStore.deleteLocation(
        props.departmentSlug,
        id,
      );
      if (!success) throw new Error('Fehler beim Löschen eines Standorts');
    }

    // 2. Create new locations
    for (const [, location] of pendingCreates.value) {
      if (!location.name.trim()) continue;

      const createDto: CreateDepartmentLocationDto = {
        name: location.name,
        badge: location.badge,
        badgeVariant: location.badgeVariant,
        street: location.street,
        city: location.city,
        mapsUrl: location.mapsUrl,
        amenities: location.amenities,
      };

      const result = await locationsStore.createLocation(
        props.departmentSlug,
        createDto,
      );
      if (!result) throw new Error('Fehler beim Erstellen eines Standorts');
    }

    // 3. Update existing locations
    for (const [id, data] of pendingUpdates.value) {
      const updateDto: UpdateDepartmentLocationDto = {
        name: data.name,
        badge: data.badge,
        badgeVariant: data.badgeVariant,
        street: data.street,
        city: data.city,
        mapsUrl: data.mapsUrl,
        amenities: data.amenities,
      };

      const result = await locationsStore.updateLocation(
        props.departmentSlug,
        id,
        updateDto,
      );
      if (!result) throw new Error('Fehler beim Aktualisieren eines Standorts');
    }

    // 4. Reorder if changed
    if (orderChanged.value) {
      const existingIds = displayLocations.value
        .filter((l) => !l._isNew)
        .map((l) => l.id);

      if (existingIds.length > 0) {
        const result = await locationsStore.reorder(
          props.departmentSlug,
          existingIds,
        );
        if (!result) throw new Error('Fehler beim Sortieren der Standorte');
      }
    }

    // Reset pending state
    pendingCreates.value.clear();
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;

    // Refresh from store
    localLocations.value = [...locationsStore.locations];
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
      v-if="displayLocations.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <svg
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <p class="text-gray-500 font-body mb-4">
        Noch keine Standorte vorhanden.
      </p>
      <button
        type="button"
        class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
        @click="handleAdd"
      >
        Ersten Standort hinzufügen
      </button>
    </div>

    <!-- Locations List -->
    <template v-else>
      <VueDraggable
        v-model="displayLocations"
        :animation="200"
        handle=".location-drag-handle"
        ghost-class="opacity-50"
        class="space-y-4"
        @end="handleDragEnd"
      >
        <LocationCard
          v-for="location in displayLocations"
          :key="location.id"
          :location="location"
          :is-new="!!location._isNew"
          @update="
            (data) =>
              handleUpdate(
                location._tempId || location.id,
                data,
                !!location._isNew,
              )
          "
          @delete="
            handleDelete(location._tempId || location.id, !!location._isNew)
          "
        />
      </VueDraggable>

      <!-- Add Button -->
      <button
        type="button"
        class="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-colors font-body text-sm flex items-center justify-center gap-2"
        @click="handleAdd"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Standort hinzufügen
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
        {{ isSaving ? 'SPEICHERN...' : 'SPEICHERN' }}
      </button>
    </div>
  </div>
</template>
