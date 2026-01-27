<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { DepartmentLocation, LocationAmenity, ContactPersonMedia } from '../types/department-extended.types';
import ImageSelector from './ImageSelector.vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import AdminIconButton from './AdminIconButton.vue';
import AdminButton from './AdminButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  location: DepartmentLocation & { _isNew?: boolean };
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (
    e: 'update',
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
  ): void;
  (e: 'delete'): void;
}>();

const name = ref(props.location.name);
const badge = ref(props.location.badge);
const badgeVariant = ref<'primary' | 'secondary'>(props.location.badgeVariant);
const street = ref(props.location.street);
const city = ref(props.location.city);
const mapsUrl = ref(props.location.mapsUrl || '');
const amenities = ref<LocationAmenity[]>([...props.location.amenities]);
const imageId = ref(props.location.imageId ?? null);
const image = ref(props.location.image ?? null);
const newAmenity = ref('');
const isExpanded = ref(true);

// Watch for external location changes
watch(
  () => props.location,
  (newLocation) => {
    name.value = newLocation.name;
    badge.value = newLocation.badge;
    badgeVariant.value = newLocation.badgeVariant;
    street.value = newLocation.street;
    city.value = newLocation.city;
    mapsUrl.value = newLocation.mapsUrl || '';
    amenities.value = [...newLocation.amenities];
    imageId.value = newLocation.imageId ?? null;
    image.value = newLocation.image ?? null;
  },
);

// Emit updates when values change
watch(
  [name, badge, badgeVariant, street, city, mapsUrl, amenities, imageId, image],
  ([newName, newBadge, newVariant, newStreet, newCity, newMapsUrl, newAmenities, newImageId, newImage]) => {
    // Check if anything actually changed to prevent recursive updates via parent re-rendering
    if (
      newName === props.location.name &&
      newBadge === props.location.badge &&
      newVariant === props.location.badgeVariant &&
      newStreet === props.location.street &&
      newCity === props.location.city &&
      newMapsUrl === (props.location.mapsUrl || '') &&
      JSON.stringify(newAmenities) === JSON.stringify(props.location.amenities) &&
      newImageId === (props.location.imageId ?? null) &&
      newImage?.id === props.location.image?.id
    ) {
      return;
    }

    emit('update', {
      name: newName,
      badge: newBadge,
      badgeVariant: newVariant,
      street: newStreet,
      city: newCity,
      mapsUrl: newMapsUrl,
      amenities: newAmenities,
      imageId: newImageId,
      image: newImage,
    });
  },
  { deep: true },
);

const amenityCount = computed(() => amenities.value.length);

function handleDelete() {
  emit('delete');
}

function handleAddAmenity() {
  if (!newAmenity.value.trim()) return;
  amenities.value.push({ text: newAmenity.value.trim() });
  newAmenity.value = '';
}

function handleRemoveAmenity(index: number) {
  amenities.value.splice(index, 1);
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
      <div class="cursor-grab text-gray-400 hover:text-gray-600 location-drag-handle shrink-0">
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

      <!-- Location Icon -->
      <FontAwesomeIcon
        icon="location-dot"
        class="text-vsg-blue-600"
      />

      <!-- Location Name -->
      <div class="flex-1 min-w-0">
        <VsgInput
          v-model="name"
          id="location-name"
          type="text"
          placeholder="Standortname"
          variant="inline"
          class="font-semibold"
        />
      </div>

      <!-- Amenity Count Badge -->
      <span class="px-2 py-1 bg-vsg-blue-100 text-vsg-blue-700 text-xs font-body rounded">
        {{ amenityCount }}
        {{ amenityCount === 1 ? 'Ausstattung' : 'Ausstattungen' }}
      </span>

      <!-- Delete Button -->
      <AdminIconButton
        icon="trash"
        variant="delete"
        title="Standort löschen"
        with-background
        @click="handleDelete"
      />
    </div>

    <!-- Card Body (Collapsible) -->
    <div
      v-show="isExpanded"
      class="p-4 space-y-4"
    >
      <!-- Image Selection -->
      <div>
        <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2"> Standortfoto </label>
        <ImageSelector
          v-model:media-id="imageId"
          v-model:media="image"
          label="Foto auswählen oder hochladen"
        />
      </div>

      <!-- Badge Row -->
      <div class="grid grid-cols-2 gap-3">
        <VsgInput
          v-model="badge"
          id="location-badge"
          type="text"
          label="Badge Text"
          placeholder="z.B. Haupthalle"
          variant="inline"
        />
        <div>
          <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"> Badge Variante </label>
          <select
            v-model="badgeVariant"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option value="primary">Primär (Blau)</option>
            <option value="secondary">Sekundär (Lime)</option>
          </select>
        </div>
      </div>

      <!-- Address Row -->
      <div class="grid grid-cols-2 gap-3">
        <VsgInput
          v-model="street"
          id="location-street"
          type="text"
          label="Straße"
          placeholder="Musterstraße 123"
          variant="inline"
        />
        <VsgInput
          v-model="city"
          id="location-city"
          type="text"
          label="Stadt"
          placeholder="12345 Musterstadt"
          variant="inline"
        />
      </div>

      <!-- Maps URL -->
      <VsgInput
        v-model="mapsUrl"
        id="location-maps-url"
        type="url"
        label="Maps URL"
        placeholder="https://maps.example.com/... (optional)"
        variant="inline"
      />

      <!-- Amenities Section -->
      <div>
        <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2"> Ausstattung </label>

        <!-- Amenities List -->
        <div
          v-if="amenities.length > 0"
          class="flex flex-wrap gap-2 mb-3"
        >
          <div
            v-for="(amenity, index) in amenities"
            :key="index"
            class="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm text-vsg-blue-900"
          >
            <span>{{ amenity.text }}</span>
            <button
              type="button"
              class="p-0.5 text-gray-400 hover:text-red-500 rounded-full"
              @click="handleRemoveAmenity(index)"
            >
              <FontAwesomeIcon icon="xmark" />
            </button>
          </div>
        </div>

        <!-- Add Amenity Input -->
        <div class="flex gap-2">
          <VsgInput
            v-model="newAmenity"
            id="new-amenity"
            type="text"
            placeholder="z.B. Parkplatz"
            variant="inline"
            class="flex-1"
            @keydown.enter.prevent="handleAddAmenity"
          />
          <AdminButton
            size="small"
            variant="ghost"
            @click="handleAddAmenity"
          >
            Hinzufügen
          </AdminButton>
        </div>
      </div>
    </div>
  </div>
</template>
