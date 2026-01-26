<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsersStore, type User } from '../stores/usersStore';
import VsgDataTable from '@/shared/components/VsgDataTable.vue';
import type { Column, ActionButton } from '@/shared/types/table.types';
import { formatDate, getInitials } from '@/shared/utils/formatters';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchUsers();
});

async function handlePageChange(page: number) {
  await usersStore.fetchUsers(page);
}

async function handleDelete(user: User) {
  const confirmed = window.confirm(`Möchtest du den Benutzer "${user.username}" wirklich löschen?`);
  if (!confirmed) return;

  await usersStore.deleteUser(user.id);
}

// Column definitions
const columns: Column<User>[] = [
  {
    key: 'username',
    label: 'Benutzername',
  },
  {
    key: 'email',
    label: 'E-Mail',
  },
  {
    key: 'createdAt',
    label: 'Registriert',
    render: (item) => formatDate(item.createdAt),
  },
];

// Action buttons
const actions: ActionButton<User>[] = [
  {
    type: 'edit',
    to: (item) => `/admin/benutzer/${item.id}/edit`,
    title: 'Bearbeiten',
  },
  {
    type: 'delete',
    onClick: handleDelete,
    title: 'Löschen',
  },
];
</script>

<template>
  <VsgDataTable
    title="Benutzer"
    description="Verwalte alle registrierten Benutzer"
    add-button-text="Benutzer hinzufügen"
    add-button-route="/admin/benutzer/new"
    :items="usersStore.users"
    :columns="columns"
    :loading="usersStore.isLoading"
    :error="usersStore.error"
    :pagination="usersStore.meta"
    :actions="actions"
    empty-message="Keine Benutzer vorhanden."
    empty-action-text="Ersten Benutzer erstellen"
    empty-action-route="/admin/benutzer/new"
    @page-change="handlePageChange"
  >
    <!-- Custom username column with avatar -->
    <template #cell-username="{ item }">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-vsg-blue-600 rounded-full flex items-center justify-center text-white font-display text-sm">
          {{ getInitials(item.username) }}
        </div>
        <span class="font-body text-sm text-vsg-blue-900">{{ item.username }}</span>
      </div>
    </template>
  </VsgDataTable>
</template>
