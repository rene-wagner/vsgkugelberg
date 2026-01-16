<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettingsStore, type ClubSettings, type UpdateSettingsData } from '../stores/settingsStore';

const props = defineProps<{
  settings: ClubSettings | null;
}>();

const settingsStore = useSettingsStore();
const foundingDate = ref<string>('');
const address = ref<string>('');
const memberCount = ref<number | null>(null);
const contactEmail = ref<string>('');
const contactPhone = ref<string>('');

// Helper to format ISO date to YYYY-MM-DD for date input
const formatDateForInput = (dateStr: string | null) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch (_e) {
    return '';
  }
};

// Watch for settings prop changes to populate form
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings) {
      foundingDate.value = formatDateForInput(newSettings.foundingDate);
      address.value = newSettings.address || '';
      memberCount.value = newSettings.memberCount;
      contactEmail.value = newSettings.contactEmail || '';
      contactPhone.value = newSettings.contactPhone || '';
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  settingsStore.clearMessages();

  const updateData: UpdateSettingsData = {
    foundingDate: foundingDate.value ? new Date(foundingDate.value).toISOString() : null,
    address: address.value.trim() || null,
    memberCount: memberCount.value || null,
    contactEmail: contactEmail.value.trim() || null,
    contactPhone: contactPhone.value.trim() || null,
  };

  await settingsStore.updateSettings(updateData);
}
</script>

<template>
  <form
    class="max-w-3xl"
    @submit.prevent="handleSubmit"
  >
    <!-- Success Message -->
    <div
      v-if="settingsStore.successMessage"
      class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-green-600 font-body">
        {{ settingsStore.successMessage }}
      </p>
    </div>

    <!-- Error Message -->
    <div
      v-if="settingsStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ settingsStore.error }}</p>
    </div>

    <!-- Club Information Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Vereinsdaten</h2>

      <div class="space-y-6">
        <!-- Founding Date -->
        <div>
          <label
            for="foundingDate"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Gründungsdatum
          </label>
          <input
            id="foundingDate"
            v-model="foundingDate"
            type="date"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <!-- Member Count -->
        <div>
          <label
            for="memberCount"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Mitgliederanzahl
          </label>
          <input
            id="memberCount"
            v-model.number="memberCount"
            type="number"
            min="1"
            max="100000"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. 500"
          />
        </div>

        <!-- Address -->
        <div>
          <label
            for="address"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Adresse
          </label>
          <textarea
            id="address"
            v-model="address"
            rows="3"
            maxlength="500"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 resize-none"
            placeholder="Vereinsadresse eingeben..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Contact Information Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Kontaktdaten</h2>

      <div class="space-y-6">
        <!-- Contact Email -->
        <div>
          <label
            for="contactEmail"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            E-Mail
          </label>
          <input
            id="contactEmail"
            v-model="contactEmail"
            type="email"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. info@verein.de"
          />
        </div>

        <!-- Contact Phone -->
        <div>
          <label
            for="contactPhone"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Telefon
          </label>
          <input
            id="contactPhone"
            v-model="contactPhone"
            type="tel"
            maxlength="30"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. +49 30 123456"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end border-t border-gray-200 pt-6">
      <button
        type="submit"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="settingsStore.isSaving"
      >
        {{ settingsStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>
