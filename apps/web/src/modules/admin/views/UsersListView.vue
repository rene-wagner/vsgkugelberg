<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsersStore } from '../stores/usersStore';
import VsgPagination from '@/shared/components/VsgPagination.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchUsers();
});

async function handlePageChange(page: number) {
  await usersStore.fetchUsers(page);
}

function getInitials(username: string): string {
  return username
    .split(/[\s._-]+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function handleDelete(userId: number, username: string) {
  const confirmed = window.confirm(`Möchtest du den Benutzer "${username}" wirklich löschen?`);
  if (!confirmed) return;

  await usersStore.deleteUser(userId);
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Benutzer</h1>
        <p class="font-body font-normal text-vsg-blue-600 mt-1">Verwalte alle registrierten Benutzer</p>
      </div>
      <router-link
        to="/admin/benutzer/new"
        class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
      >
        Benutzer hinzufügen
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="usersStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <p class="text-sm text-red-600 font-body">{{ usersStore.error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Benutzername</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">E-Mail</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Registriert</th>
              <th class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in usersStore.users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-vsg-blue-600 rounded-full flex items-center justify-center text-white font-display text-sm">
                    {{ getInitials(user.username) }}
                  </div>
                  <span class="font-body text-sm text-vsg-blue-900">{{ user.username }}</span>
                </div>
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/benutzer/${user.id}/edit`"
                    class="p-2 text-gray-400 hover:text-vsg-blue-600 transition-colors"
                    title="Bearbeiten"
                  >
                    <FontAwesomeIcon icon="pen-to-square" />
                  </router-link>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                    @click="handleDelete(user.id, user.username)"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="usersStore.users.length === 0" class="px-6 py-12 text-center">
        <p class="font-body text-gray-500">Keine Benutzer vorhanden.</p>
        <router-link to="/admin/benutzer/new" class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm">
          Ersten Benutzer erstellen
        </router-link>
      </div>

      <!-- Pagination -->
      <VsgPagination v-if="usersStore.users.length > 0" :meta="usersStore.meta" @page-change="handlePageChange" />
    </div>
  </div>
</template>
