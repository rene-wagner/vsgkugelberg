<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import VsgContactPersonSelect from '@/shared/components/VsgContactPersonSelect.vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import type { DepartmentTrainer, TrainerLicense } from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
    },
  ): void;
  (e: 'delete'): void;
}>();

const contactPersonId = ref<number | null>(props.trainer.contactPersonId || null);
const role = ref(props.trainer.role);
const licenses = ref<TrainerLicense[]>([...props.trainer.licenses]);
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
  },
);

// Emit updates when values change
watch(
  [contactPersonId, role, licenses],
  () => {
    emit('update', {
      contactPersonId: contactPersonId.value,
      role: role.value,
      licenses: licenses.value,
    });
  },
  { deep: true },
);

// Exclude IDs that are already used (except current trainer's contact person)
const excludedContactPersonIds = computed(() => {
  return props.usedContactPersonIds.filter((id) => id !== props.trainer.contactPersonId);
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
    <div class="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
      <!-- Drag Handle -->
      <div class="cursor-grab text-gray-400 hover:text-gray-600 trainer-drag-handle shrink-0">
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

      <!-- Trainer Avatar -->
      <img
        v-if="profileImageUrl"
        :src="profileImageUrl"
        :alt="trainerName"
        class="w-10 h-10 rounded-full object-cover shrink-0"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-vsg-blue-100 flex items-center justify-center text-vsg-blue-600 text-sm font-medium shrink-0"
      >
        <FontAwesomeIcon icon="user" />
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
      <span class="px-2 py-1 bg-vsg-blue-100 text-vsg-blue-700 text-xs font-body rounded">
        {{ licenseCount }} {{ licenseCount === 1 ? 'Lizenz' : 'Lizenzen' }}
      </span>

      <!-- Delete Button -->
      <button
        type="button"
        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Trainer löschen"
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
      <!-- Contact Person Select -->
      <div>
        <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-1">
          Ansprechpartner <span class="text-red-500">*</span>
        </label>
        <VsgContactPersonSelect
          v-model="contactPersonId"
          :exclude-ids="excludedContactPersonIds"
        />
        <p class="mt-1 text-xs text-gray-400">Der Trainer muss als Ansprechpartner angelegt sein.</p>
      </div>

      <!-- Role -->
      <VsgInput
        v-model="role"
        id="trainer-role"
        type="text"
        label="Rolle"
        placeholder="z.B. Cheftrainer, Co-Trainer"
        variant="inline"
      />

      <!-- Licenses Section -->
      <div>
        <label class="block font-body text-xs text-gray-500 uppercase tracking-wider mb-2"> Lizenzen </label>

        <!-- Licenses List -->
        <div
          v-if="licenses.length > 0"
          class="flex flex-wrap gap-2 mb-3"
        >
          <div
            v-for="(license, index) in licenses"
            :key="index"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
            :class="license.variant === 'gold' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'"
          >
            <span>{{ license.name }}</span>
            <button
              type="button"
              class="p-0.5 hover:bg-white/30 rounded-full"
              @click="handleRemoveLicense(index)"
            >
              <FontAwesomeIcon icon="xmark" />
            </button>
          </div>
        </div>

        <!-- Add License Form -->
        <div class="flex gap-2">
          <VsgInput
            v-model="newLicenseName"
            id="new-license-name"
            type="text"
            placeholder="Lizenzname"
            variant="inline"
            class="flex-1"
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
