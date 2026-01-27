<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useDepartmentLocationsStore } from '../stores/departmentLocationsStore';
import LocationCard from './LocationCard.vue';
import AdminButton from './AdminButton.vue';
import AdminAddButton from './AdminAddButton.vue';
import type {
  DepartmentLocation,
  LocationAmenity,
  ContactPersonMedia,
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
const sortableIds = ref<number[]>([]);
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
      imageId: number | null;
      image: ContactPersonMedia | null;
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
    localLocations.value = [...newLocations]
      .map((l) => ({
        ...l,
        imageId: l.imageId ?? null,
        image: l.image ?? null,
      }))
      .sort((a, b) => a.sort - b.sort);

    sortableIds.value = localLocations.value.map((l) => l.id);

    pendingCreates.value.clear();
    pendingUpdates.value.clear();
    pendingDeletes.value.clear();
    orderChanged.value = false;
  },
  { immediate: true },
);

// Computed: Display locations
const displayLocations = computed({
  get: () => {
    return sortableIds.value
      .map((id) => {
        if (id < 0) {
          return pendingCreates.value.get(id);
        }
        const l = localLocations.value.find((loc) => loc.id === id);
        if (!l) return null;
        const pending = pendingUpdates.value.get(l.id);
        return pending ? { ...l, ...pending } : l;
      })
      .filter((l): l is LocalLocation => !!l);
  },
  set: (newItems: LocalLocation[]) => {
    sortableIds.value = newItems.map((l) => l.id);
    orderChanged.value = true;
  },
});

const isDirty = computed(() => {
  return pendingCreates.value.size > 0 || pendingUpdates.value.size > 0 || pendingDeletes.value.size > 0 || orderChanged.value;
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
    imageId: null,
    image: null,
    sort: localLocations.value.length + pendingCreates.value.size,
    createdAt: '',
    updatedAt: '',
  };
  pendingCreates.value.set(tempId, newLocation);
  sortableIds.value.push(tempId);
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
    imageId: number | null;
    image: ContactPersonMedia | null;
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
    // 1. Delete locations
    for (const id of pendingDeletes.value) {
      const success = await locationsStore.deleteLocation(props.departmentSlug, id);
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
        imageId: location.imageId,
      };

      const result = await locationsStore.createLocation(props.departmentSlug, createDto);
      if (!result) throw new Error('Fehler beim Erstellen eines Standorts');

      // Update sortableIds with the real ID
      const idx = sortableIds.value.indexOf(location.id);
      if (idx !== -1) {
        sortableIds.value[idx] = result.id;
      }
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
        imageId: data.imageId,
      };

      const result = await locationsStore.updateLocation(props.departmentSlug, id, updateDto);
      if (!result) throw new Error('Fehler beim Aktualisieren eines Standorts');
    }

    // 4. Reorder if changed
    if (orderChanged.value) {
      const existingIds = sortableIds.value.filter((id) => id > 0);

      if (existingIds.length > 0) {
        const result = await locationsStore.reorder(props.departmentSlug, existingIds);
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
    sortableIds.value = localLocations.value.map((l) => l.id);
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
      v-if="displayLocations.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <FontAwesomeIcon
        icon="location-dot"
        size="2x"
        class="mb-4 text-gray-400"
      />

      <p class="text-gray-500 font-body mb-4">Noch keine Standorte vorhanden.</p>
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
          @update="(data) => handleUpdate(location._tempId || location.id, data, !!location._isNew)"
          @delete="handleDelete(location._tempId || location.id, !!location._isNew)"
        />
      </VueDraggable>

      <!-- Add Button -->
      <AdminAddButton
        label="Standort hinzufügen"
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
