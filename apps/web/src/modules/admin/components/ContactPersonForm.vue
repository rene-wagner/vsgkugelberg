<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  useContactPersonsStore,
  type ContactPerson,
  type CreateContactPersonData,
  type UpdateContactPersonData,
} from '../stores/contactPersonsStore';
import ProfileImageSelector from './ProfileImageSelector.vue';

const props = defineProps<{
  contactPerson: ContactPerson | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const contactPersonsStore = useContactPersonsStore();

const firstName = ref('');
const lastName = ref('');
const type = ref('');
const email = ref('');
const address = ref('');
const phone = ref('');
const profileImageId = ref<number | null>(null);
const error = ref('');
const isSubmitting = ref(false);

// Watch for contactPerson prop changes to populate form
watch(
  () => props.contactPerson,
  (newContactPerson) => {
    if (newContactPerson) {
      firstName.value = newContactPerson.firstName;
      lastName.value = newContactPerson.lastName;
      type.value = newContactPerson.type;
      email.value = newContactPerson.email || '';
      address.value = newContactPerson.address || '';
      phone.value = newContactPerson.phone;
      profileImageId.value = newContactPerson.profileImageId;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return firstName.value.trim() !== '' && lastName.value.trim() !== '' && type.value.trim() !== '' && phone.value.trim() !== '';
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.contactPerson) {
      // Update existing contact person
      const updateData: UpdateContactPersonData = {
        firstName: firstName.value,
        lastName: lastName.value,
        type: type.value,
        email: email.value || undefined,
        address: address.value || undefined,
        phone: phone.value,
        profileImageId: profileImageId.value,
      };

      const result = await contactPersonsStore.updateContactPerson(props.contactPerson.id, updateData);
      if (result) {
        router.push('/admin/contact-persons');
      } else {
        error.value = contactPersonsStore.error || 'Fehler beim Aktualisieren des Ansprechpartners';
      }
    } else {
      // Create new contact person
      const createData: CreateContactPersonData = {
        firstName: firstName.value,
        lastName: lastName.value,
        type: type.value,
        email: email.value || undefined,
        address: address.value || undefined,
        phone: phone.value,
      };
      // Only include profileImageId if set
      if (profileImageId.value !== null) {
        createData.profileImageId = profileImageId.value;
      }

      const result = await contactPersonsStore.createContactPerson(createData);
      if (result) {
        router.push('/admin/contact-persons');
      } else {
        error.value = contactPersonsStore.error || 'Fehler beim Erstellen des Ansprechpartners';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.contactPerson) return;

  const confirmed = window.confirm(
    `Möchtest du den Ansprechpartner "${props.contactPerson.firstName} ${props.contactPerson.lastName}" wirklich löschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await contactPersonsStore.deleteContactPerson(props.contactPerson.id);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/contact-persons');
  } else {
    error.value = contactPersonsStore.error || 'Fehler beim Löschen des Ansprechpartners';
  }
}

function handleCancel() {
  router.push('/admin/contact-persons');
}
</script>

<template>
  <form
    class="max-w-3xl"
    @submit.prevent="handleSubmit"
  >
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Contact Person Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">ANSPRECHPARTNER DATEN</h2>

      <div class="space-y-6">
        <!-- First Name -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              for="firstName"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Vorname <span class="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              required
              class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
              placeholder="z.B. Max"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label
              for="lastName"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Nachname <span class="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              required
              class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
              placeholder="z.B. Mustermann"
            />
          </div>
        </div>

        <!-- Type -->
        <div>
          <label
            for="type"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Funktion / Rolle <span class="text-red-500">*</span>
          </label>
          <input
            id="type"
            v-model="type"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Vorstandsvorsitzender, Schatzmeister, Trainer"
          />
        </div>

        <!-- Phone -->
        <div>
          <label
            for="phone"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Telefon <span class="text-red-500">*</span>
          </label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. +49 123 456789"
          />
        </div>

        <!-- Email -->
        <div>
          <label
            for="email"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            E-Mail
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. max@example.com"
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
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 resize-none"
            placeholder="z.B. Musterstraße 1, 12345 Musterstadt"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Profile Image Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">PROFILBILD</h2>

      <div>
        <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Profilbild </label>
        <ProfileImageSelector
          v-model="profileImageId"
          :current-image="contactPerson?.profileImage ?? null"
        />
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-6">
      <button
        type="button"
        class="px-6 py-2.5 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
        @click="handleCancel"
      >
        Abbrechen
      </button>

      <div class="flex items-center gap-3">
        <button
          v-if="isEditMode"
          type="button"
          class="px-6 py-2.5 border border-red-300 text-red-600 font-body text-sm rounded-lg hover:bg-red-50 transition-colors"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          Ansprechpartner löschen
        </button>
        <button
          type="submit"
          class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'Speichern...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </form>
</template>
