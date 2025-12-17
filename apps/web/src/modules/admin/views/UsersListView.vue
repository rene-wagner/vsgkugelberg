<script setup lang="ts">
import { ref } from 'vue';

// Dummy data
const users = ref([
  {
    id: 1,
    name: 'Max Mustermann',
    initials: 'MM',
    email: 'max@vsg-kugelberg.de',
    role: 'admin',
    roleLabel: 'Administrator',
    status: 'active',
    registeredAt: '15.01.2024',
  },
  {
    id: 2,
    name: 'Erika Schmidt',
    initials: 'ES',
    email: 'erika.schmidt@email.de',
    role: 'editor',
    roleLabel: 'Redakteur',
    status: 'active',
    registeredAt: '22.02.2024',
  },
  {
    id: 3,
    name: 'Thomas Muller',
    initials: 'TM',
    email: 't.mueller@email.de',
    role: 'member',
    roleLabel: 'Mitglied',
    status: 'active',
    registeredAt: '10.03.2024',
  },
  {
    id: 4,
    name: 'Anna Weber',
    initials: 'AW',
    email: 'anna.weber@email.de',
    role: 'member',
    roleLabel: 'Mitglied',
    status: 'inactive',
    registeredAt: '05.04.2024',
  },
  {
    id: 5,
    name: 'Peter Klein',
    initials: 'PK',
    email: 'peter.klein@email.de',
    role: 'member',
    roleLabel: 'Mitglied',
    status: 'active',
    registeredAt: '18.05.2024',
  },
]);

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'bg-vsg-gold-400 text-vsg-blue-900';
    case 'editor':
      return 'bg-vsg-blue-100 text-vsg-blue-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        BENUTZER
      </h1>
      <p class="font-body font-extralight text-vsg-blue-600 mt-1">
        Verwalte alle registrierten Benutzer
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
              placeholder="Name oder E-Mail..."
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

        <!-- Role Filter -->
        <div class="w-48">
          <label
            class="block font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >Rolle</label
          >
          <select
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 appearance-none cursor-pointer"
          >
            <option value="">Alle Rollen</option>
            <option value="admin">Administrator</option>
            <option value="editor">Redakteur</option>
            <option value="member">Mitglied</option>
          </select>
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
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
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
                Name
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                E-Mail
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Rolle
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Status
              </th>
              <th
                class="text-left px-6 py-4 font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Registriert
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
              v-for="user in users"
              :key="user.id"
              class="table-row-hover transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-vsg-blue-600 rounded-full flex items-center justify-center text-white font-display text-sm"
                  >
                    {{ user.initials }}
                  </div>
                  <span class="font-body text-sm text-vsg-blue-900">{{
                    user.name
                  }}</span>
                </div>
              </td>
              <td
                class="px-6 py-4 font-body font-extralight text-sm text-gray-600"
              >
                {{ user.email }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-block px-2 py-1 font-body text-xs rounded font-medium"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ user.roleLabel }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="user.status === 'active'"
                  class="inline-flex items-center gap-1.5 font-body text-sm text-green-600"
                >
                  <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                  Aktiv
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 font-body text-sm text-gray-400"
                >
                  <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
                  Inaktiv
                </span>
              </td>
              <td
                class="px-6 py-4 font-body font-extralight text-sm text-gray-500"
              >
                {{ user.registeredAt }}
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
