<script setup lang="ts">
import { ref } from 'vue';

// Dummy data
const news = ref([
  {
    id: 1,
    title: 'Badminton-Turnier erfolgreich abgeschlossen',
    author: 'Max Mustermann',
    authorInitials: 'MM',
    status: 'published',
    statusLabel: 'Veroffentlicht',
    date: '15.12.2024',
  },
  {
    id: 2,
    title: 'Neue Trainingszeiten ab Januar',
    author: 'Erika Schmidt',
    authorInitials: 'ES',
    status: 'published',
    statusLabel: 'Veroffentlicht',
    date: '10.12.2024',
  },
  {
    id: 3,
    title: 'Weihnachtsfeier des Vereins',
    author: 'Max Mustermann',
    authorInitials: 'MM',
    status: 'draft',
    statusLabel: 'Entwurf',
    date: '08.12.2024',
  },
  {
    id: 4,
    title: 'Volleyball-Mannschaft qualifiziert sich fur Regionalliga',
    author: 'Thomas Muller',
    authorInitials: 'TM',
    status: 'published',
    statusLabel: 'Veroffentlicht',
    date: '01.12.2024',
  },
  {
    id: 5,
    title: 'Jahreshauptversammlung 2025',
    author: 'Erika Schmidt',
    authorInitials: 'ES',
    status: 'draft',
    statusLabel: 'Entwurf',
    date: '28.11.2024',
  },
]);

function getStatusBadgeClass(status: string) {
  return status === 'published'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-600';
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        NEWS
      </h1>
      <p class="font-body font-extralight text-vsg-blue-600 mt-1">
        Verwalte alle Neuigkeiten
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label
            class="block font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >Suche</label
          >
          <div class="relative">
            <input
              type="text"
              placeholder="Titel..."
              class="form-input-custom w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 placeholder-gray-400 text-sm focus:outline-none focus:border-vsg-blue-600"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="w-48">
          <label
            class="block font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >Status</label
          >
          <select
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 appearance-none cursor-pointer"
          >
            <option value="">Alle</option>
            <option value="published">Veroffentlicht</option>
            <option value="draft">Entwurf</option>
          </select>
        </div>

        <!-- Filter Button -->
        <button
          class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
        >
          FILTERN
        </button>
      </div>
    </div>

    <!-- Table -->
    <div
      class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Titel
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Autor
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Status
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Datum
              </th>
              <th
                class="text-right px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in news"
              :key="item.id"
              class="table-row-hover transition-colors"
            >
              <td class="px-6 py-4">
                <span class="font-body text-sm text-vsg-blue-900 font-medium">{{
                  item.title
                }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 bg-vsg-blue-600 rounded-full flex items-center justify-center text-white font-display text-xs"
                  >
                    {{ item.authorInitials }}
                  </div>
                  <span
                    class="font-body font-extralight text-sm text-gray-600"
                    >{{ item.author }}</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-2 py-1 font-body text-xs rounded font-medium"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ item.statusLabel }}
                </span>
              </td>
              <td
                class="px-6 py-4 font-body font-extralight text-sm text-gray-500"
              >
                {{ item.date }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
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
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Loschen"
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

      <!-- Pagination -->
      <div
        class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="font-body font-extralight text-sm text-gray-500">
          Zeige
          <span class="text-vsg-blue-900 font-medium">1-5</span> von
          <span class="text-vsg-blue-900 font-medium">5</span> Eintragen
        </div>
        <div class="flex items-center gap-2">
          <button
            class="p-2 text-gray-400 hover:text-vsg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            class="w-8 h-8 bg-vsg-blue-600 text-white font-body text-sm rounded"
          >
            1
          </button>
          <button
            class="p-2 text-gray-400 hover:text-vsg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
