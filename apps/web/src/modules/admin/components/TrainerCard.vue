<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import VsgContactPersonSelect from '@/shared/components/VsgContactPersonSelect.vue';
import type {
  DepartmentTrainer,
  TrainerLicense,
} from '../types/department-extended.types';

const props = defineProps<{
  trainer: DepartmentTrainer & { _isNew?: boolean };
  isNew?: boolean;
  usedContactPersonIds: number[];
}>();

const emit = defineEmits<{
  (
    e: 'update',
    data: {
      contactPersonId: number | null;
      role: string;
      licenses: TrainerLicense[];
      experience: string;
      quote: string;
    },
  ): void;
  (e: 'delete'): void;
}>();

const contactPersonId = ref<number | null>(
  props.trainer.contactPersonId || null,
);
const role = ref(props.trainer.role);
const licenses = ref<TrainerLicense[]>([...props.trainer.licenses]);
const experience = ref(props.trainer.experience);
const quote = ref(props.trainer.quote);
const isExpanded = ref(true);

// License form state
const newLicenseName = ref('');
const newLicenseVariant = ref<'gold' | 'blue'>('blue');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Watch for external trainer changes
watch(
  () => props.trainer,
  (newTrainer) => {
    contactPersonId.value = newTrainer.contactPersonId || null;
    role.value = newTrainer.role;
    licenses.value = [...newTrainer.licenses];
    experience.value = newTrainer.experience;
    quote.value = newTrainer.quote;
  },
);

// Emit updates when values change
watch(
  [contactPersonId, role, licenses, experience, quote],
  () => {
    emit('update', {
      contactPersonId: contactPersonId.value,
      role: role.value,
      licenses: licenses.value,
      experience: experience.value,
      quote: quote.value,
    });
  },
  { deep: true },
);

// Exclude IDs that are already used (except current trainer's contact person)
const excludedContactPersonIds = computed(() => {
  return props.usedContactPersonIds.filter(
    (id) => id !== props.trainer.contactPersonId,
  );
});

const licenseCount = computed(() => licenses.value.length);

const profileImageUrl = computed(() => {
  if (!props.trainer.contactPerson?.profileImage) return null;
  return `${API_BASE_URL}/${props.trainer.contactPerson.profileImage.path}`;
});

const trainerName = computed(() => {
  if (!props.trainer.contactPerson) return 'Neuer Trainer';
  return `${props.trainer.contactPerson.firstName} ${props.trainer.contactPerson.lastName}`;
});

function handleDelete() {
  emit('delete');
}

function handleAddLicense() {
  if (!newLicenseName.value.trim()) return;
  licenses.value.push({
    name: newLicenseName.value.trim(),
    variant: newLicenseVariant.value,
  });
  newLicenseName.value = '';
}

function handleRemoveLicense(index: number) {
  licenses.value.splice(index, 1);
}
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    :class="{ 'border-vsg-lime-500': isNew }"
  >
    <!-- Card Header -->
    <div
      class="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200"
    >
      <!-- Drag Handle -->
      <div
        class="cursor-grab text-gray-400 hover:text-gray-600 trainer-drag-handle flex-shrink-0"
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
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      <!-- Expand/Collapse Toggle -->
      <button
        type="button"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        @click="isExpanded = !isExpanded"
      >
        <svg
          class="w-5 h-5 text-gray-500 transition-transform"
          :class="{ 'rotate-180': !isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Trainer Avatar -->
      <img
        v-if="profileImageUrl"
        :src="profileImageUrl"
        :alt="trainerName"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-vsg-blue-100 flex items-center justify-center text-vsg-blue-600 text-sm font-medium flex-shrink-0"
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>

      <!-- Trainer Name & Role -->
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-vsg-blue-900 text-sm truncate">
          {{ trainerName }}
        </div>
        <div class="text-xs text-gray-500 truncate">
          {{ role || 'Keine Rolle' }}
        </div>
      </div>

      <!-- License Count Badge -->
      <span
        class="px-2 py-1 bg-vsg-blue-100 text-vsg-blue-700 text-xs font-body rounded"
      >
        {{ licenseCount }} {{ licenseCount === 1 ? 'Lizenz' : 'Lizenzen' }}
      </span>

      <!-- Delete Button -->
      <button
        type="button"
        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Trainer löschen"
        @click="handleDelete"
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <!-- Card Body (Collapsible) -->
    <div v-show="isExpanded" class="p-4 space-y-4">
      <!-- Contact Person Select -->
      <div>
        <label
          class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"
        >
          Ansprechpartner <span class="text-red-500">*</span>
        </label>
        <VsgContactPersonSelect
          v-model="contactPersonId"
          :exclude-ids="excludedContactPersonIds"
        />
        <p class="mt-1 text-xs text-gray-400">
          Der Trainer muss als Ansprechpartner angelegt sein.
        </p>
      </div>

      <!-- Role -->
      <div>
        <label
          class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"
        >
          Rolle
        </label>
        <input
          v-model="role"
          type="text"
          placeholder="z.B. Cheftrainer, Co-Trainer"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>

      <!-- Experience & Quote Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"
          >
            Erfahrung
          </label>
          <input
            v-model="experience"
            type="text"
            placeholder="z.B. 15+ Jahre"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>
        <div>
          <label
            class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1"
          >
            Zitat
          </label>
          <input
            v-model="quote"
            type="text"
            placeholder="Ein kurzes Motto..."
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>
      </div>

      <!-- Licenses Section -->
      <div>
        <label
          class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2"
        >
          Lizenzen
        </label>

        <!-- Licenses List -->
        <div v-if="licenses.length > 0" class="flex flex-wrap gap-2 mb-3">
          <div
            v-for="(license, index) in licenses"
            :key="index"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
            :class="
              license.variant === 'gold'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            "
          >
            <span>{{ license.name }}</span>
            <button
              type="button"
              class="p-0.5 hover:bg-white/30 rounded-full"
              @click="handleRemoveLicense(index)"
            >
              <svg
                class="w-3 h-3"
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
        </div>

        <!-- Add License Form -->
        <div class="flex gap-2">
          <input
            v-model="newLicenseName"
            type="text"
            placeholder="Lizenzname"
            class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            @keydown.enter.prevent="handleAddLicense"
          />
          <select
            v-model="newLicenseVariant"
            class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option value="gold">Gold</option>
            <option value="blue">Blau</option>
          </select>
          <button
            type="button"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-body"
            @click="handleAddLicense"
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
