<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  useDefaultContactPersonsStore,
  type ContactPerson,
} from '../stores/contactPersonsStore';
import ContactForm from '../components/ContactForm.vue';

const contactPersonsStore = useDefaultContactPersonsStore();
const selectedContactPersonId = ref<number | null>(null);

const selectedContactPerson = computed<ContactPerson | null>(() => {
  if (selectedContactPersonId.value === null) {
    return null;
  }
  return (
    contactPersonsStore.contactPersons.find(
      (cp) => cp.id === selectedContactPersonId.value,
    ) || null
  );
});

onMounted(() => {
  contactPersonsStore.fetchContactPersons();
});

function formatOptionLabel(cp: ContactPerson): string {
  return `${cp.type}: ${cp.firstName} ${cp.lastName}`;
}

function getInitials(cp: ContactPerson): string {
  const firstInitial = cp.firstName.charAt(0).toUpperCase();
  const lastInitial = cp.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

function getProfileImageUrl(cp: ContactPerson): string | null {
  if (!cp.profileImage) return null;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${apiBaseUrl}/uploads/${cp.profileImage.filename}`;
}
</script>

<template>
  <div class="bg-white">
    <!-- Header Section -->
    <section class="bg-vsg-blue-900 pb-20 pt-40">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h1 class="font-display text-5xl tracking-wider text-white md:text-7xl">
          KONTAKT
        </h1>
        <p class="mt-4 font-body text-lg text-vsg-blue-200">
          Finden Sie den richtigen Ansprechpartner
        </p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-2xl px-6">
        <!-- Loading State -->
        <div
          v-if="contactPersonsStore.isLoading"
          class="flex items-center justify-center py-12"
        >
          <div class="text-vsg-blue-600 font-body">Laden...</div>
        </div>

        <!-- Error State -->
        <div
          v-else-if="contactPersonsStore.error"
          class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <p class="text-sm text-red-600 font-body">
            {{ contactPersonsStore.error }}
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="contactPersonsStore.contactPersons.length === 0"
          class="text-center py-12"
        >
          <p class="font-body text-vsg-blue-600">
            Derzeit sind keine Ansprechpartner verfugbar.
          </p>
        </div>

        <!-- Contact Person Selector -->
        <div v-else>
          <div class="mb-8">
            <label
              for="contact-person-select"
              class="block font-body font-normal text-sm tracking-wider text-vsg-blue-600 uppercase mb-3"
            >
              Ansprechpartner wahlen
            </label>
            <select
              id="contact-person-select"
              v-model="selectedContactPersonId"
              class="w-full px-4 py-3 bg-white border-2 border-vsg-blue-200 rounded-xl text-vsg-blue-900 text-lg font-body focus:outline-none focus:border-vsg-gold-400 transition-colors cursor-pointer appearance-none"
              style="
                background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231E3A5F%22%20d%3D%22M10.293%203.293%206%207.586%201.707%203.293A1%201%200%200%200%20.293%204.707l5%205a1%201%200%200%200%201.414%200l5-5a1%201%200%201%200-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: right 1rem center;
                padding-right: 2.5rem;
              "
            >
              <option :value="null">Bitte wahlen...</option>
              <option
                v-for="cp in contactPersonsStore.contactPersons"
                :key="cp.id"
                :value="cp.id"
              >
                {{ formatOptionLabel(cp) }}
              </option>
            </select>
          </div>

          <!-- Contact Details Card -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
          >
            <div
              v-if="selectedContactPerson"
              class="bg-vsg-blue-50 border border-vsg-blue-100 rounded-2xl p-8"
            >
              <!-- Profile Image and Name/Role Header -->
              <div class="mb-6 pb-6 border-b border-vsg-blue-200">
                <div class="flex items-center gap-6">
                  <!-- Profile Image or Initials Fallback -->
                  <div
                    class="flex-shrink-0 w-32 h-32 rounded-full overflow-hidden bg-vsg-blue-100 flex items-center justify-center"
                  >
                    <img
                      v-if="selectedContactPerson.profileImage"
                      :src="getProfileImageUrl(selectedContactPerson)!"
                      :alt="`Profilbild von ${selectedContactPerson.firstName} ${selectedContactPerson.lastName}`"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span
                      v-else
                      class="text-3xl font-display text-vsg-blue-400"
                    >
                      {{ getInitials(selectedContactPerson) }}
                    </span>
                  </div>
                  <!-- Name and Role -->
                  <div>
                    <h2
                      class="font-display text-2xl tracking-wider text-vsg-blue-900"
                    >
                      {{ selectedContactPerson.firstName }}
                      {{ selectedContactPerson.lastName }}
                    </h2>
                    <span
                      class="inline-block mt-2 px-3 py-1 bg-vsg-gold-400 text-vsg-blue-900 text-sm font-body rounded-full"
                    >
                      {{ selectedContactPerson.type }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="space-y-4">
                <!-- Phone -->
                <div class="flex items-start gap-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-vsg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-vsg-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span
                      class="block text-sm font-body text-vsg-blue-500 uppercase tracking-wider"
                      >Telefon</span
                    >
                    <a
                      :href="`tel:${selectedContactPerson.phone}`"
                      class="font-body text-lg text-vsg-blue-900 hover:text-vsg-gold-600 transition-colors"
                    >
                      {{ selectedContactPerson.phone }}
                    </a>
                  </div>
                </div>

                <!-- Email -->
                <div class="flex items-start gap-4">
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-vsg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-vsg-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span
                      class="block text-sm font-body text-vsg-blue-500 uppercase tracking-wider"
                      >E-Mail</span
                    >
                    <a
                      :href="`mailto:${selectedContactPerson.email}`"
                      class="font-body text-lg text-vsg-blue-900 hover:text-vsg-gold-600 transition-colors"
                    >
                      {{ selectedContactPerson.email }}
                    </a>
                  </div>
                </div>

                <!-- Address (if available) -->
                <div
                  v-if="selectedContactPerson.address"
                  class="flex items-start gap-4"
                >
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-vsg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5 text-vsg-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span
                      class="block text-sm font-body text-vsg-blue-500 uppercase tracking-wider"
                      >Adresse</span
                    >
                    <p
                      class="font-body text-lg text-vsg-blue-900 whitespace-pre-line"
                    >
                      {{ selectedContactPerson.address }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Contact Form (shown when a contact person is selected) -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out delay-150"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
          >
            <ContactForm
              v-if="selectedContactPerson"
              :contact-person-id="selectedContactPerson.id"
              :contact-person-name="`${selectedContactPerson.firstName} ${selectedContactPerson.lastName}`"
            />
          </Transition>

          <!-- Default Message when no selection -->
          <div
            v-if="!selectedContactPerson"
            class="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <svg
              class="w-16 h-16 mx-auto text-vsg-blue-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p class="mt-4 font-body text-vsg-blue-500">
              Wahlen Sie einen Ansprechpartner aus der Liste, um die
              Kontaktdaten anzuzeigen.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
