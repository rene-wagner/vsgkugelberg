<script setup lang="ts">
import { onMounted } from 'vue';
import { useContactPersonsStore } from '../stores/contactPersonsStore';
import VsgPagination from '@/shared/components/VsgPagination.vue';

const contactPersonsStore = useContactPersonsStore();

onMounted(() => {
  contactPersonsStore.fetchContactPersons();
});

async function handlePageChange(page: number) {
  await contactPersonsStore.fetchContactPersons(page);
}

async function handleDelete(id: number, firstName: string, lastName: string) {
  const confirmed = window.confirm(
    `Mochtest du den Ansprechpartner "${firstName} ${lastName}" wirklich loschen?`,
  );
  if (!confirmed) return;

  await contactPersonsStore.deleteContactPerson(id);
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
          ANSPRECHPARTNER
        </h1>
        <p class="font-body font-normal text-vsg-blue-600 mt-1">
          Verwalte alle Ansprechpartner des Vereins
        </p>
      </div>
      <router-link
        to="/admin/contact-persons/new"
        class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
      >
        ANSPRECHPARTNER HINZUFUGEN
      </router-link>
    </div>

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
      class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <p class="text-sm text-red-600 font-body">
        {{ contactPersonsStore.error }}
      </p>
    </div>

    <!-- Table -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Name
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Funktion
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Telefon
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                E-Mail
              </th>
              <th
                class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="contactPerson in contactPersonsStore.contactPersons"
              :key="contactPerson.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <span class="font-body text-sm text-vsg-blue-900 font-medium">
                  {{ contactPerson.firstName }} {{ contactPerson.lastName }}
                </span>
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ contactPerson.type }}
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ contactPerson.phone }}
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ contactPerson.email || '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/contact-persons/${contactPerson.id}/edit`"
                    class="p-2 text-gray-400 hover:text-vsg-blue-600 transition-colors"
                    title="Bearbeiten"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </router-link>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Loschen"
                    @click="
                      handleDelete(
                        contactPerson.id,
                        contactPerson.firstName,
                        contactPerson.lastName,
                      )
                    "
                  >
                    <svg
                      class="w-4 h-4"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-if="contactPersonsStore.contactPersons.length === 0"
        class="px-6 py-12 text-center"
      >
        <p class="font-body text-gray-500">Keine Ansprechpartner vorhanden.</p>
        <router-link
          to="/admin/contact-persons/new"
          class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm"
        >
          Ersten Ansprechpartner erstellen
        </router-link>
      </div>

      <!-- Pagination -->
      <VsgPagination
        v-if="contactPersonsStore.contactPersons.length > 0"
        :meta="contactPersonsStore.meta"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
